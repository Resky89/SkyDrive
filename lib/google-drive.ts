import { google } from "googleapis";
import { decrypt, encrypt } from "@/lib/encryption";
import { db } from "@/lib/db";

const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getAuthorizationUrl(state?: string): string {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent select_account",
    state,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function getGoogleDriveClient(storageAccountId: string) {
  const account = await db.storageAccount.findUnique({
    where: { id: storageAccountId },
  });

  if (!account) throw new Error("Storage account not found");

  const oauth2Client = createOAuth2Client();
  const accessToken = decrypt(account.accessTokenEnc);
  const refreshToken = decrypt(account.refreshTokenEnc);

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: account.tokenExpiresAt?.getTime(),
  });

  // Auto-refresh token if expired
  oauth2Client.on("tokens", async (newTokens) => {
    if (newTokens.access_token) {
      await db.storageAccount.update({
        where: { id: storageAccountId },
        data: {
          accessTokenEnc: encrypt(newTokens.access_token),
          tokenExpiresAt: newTokens.expiry_date
            ? new Date(newTokens.expiry_date)
            : undefined,
        },
      });
    }
  });

  return google.drive({ version: "v3", auth: oauth2Client });
}

export async function getStorageQuota(storageAccountId: string) {
  const drive = await getGoogleDriveClient(storageAccountId);
  const { data } = await drive.about.get({
    fields: "storageQuota,user",
  });

  const quota = data.storageQuota;
  const rawLimit = quota?.limit ? BigInt(quota.limit) : BigInt(0);
  const rawUsed = quota?.usageInDrive
    ? BigInt(quota.usageInDrive)
    : quota?.usage
    ? BigInt(quota.usage)
    : BigInt(0);

  const total = rawLimit;
  const used = rawUsed;
  const available = total >= used ? total - used : BigInt(0);
  const percentage =
    total > BigInt(0)
      ? Math.min((Number(used) / Number(total)) * 100, 100)
      : 0;

  return {
    total,
    used,
    available,
    percentage,
    user: data.user,
  };
}

export async function listFiles(
  storageAccountId: string,
  options: {
    query?: string;
    pageSize?: number;
    pageToken?: string;
    folderId?: string;
    scope?: "mydrive" | "sharedWithMe";
  } = {}
) {
  const drive = await getGoogleDriveClient(storageAccountId);
  const { query, pageSize = 50, pageToken, folderId, scope = "mydrive" } = options;

  let q = "trashed = false";
  if (folderId && folderId !== "root") {
    q += ` and '${folderId}' in parents`;
  } else if (scope === "sharedWithMe") {
    q += " and sharedWithMe = true";
  } else {
    q += " and 'root' in parents";
  }

  if (query) {
    q += ` and name contains '${query.replace(/'/g, "\\'")}'`;
  }

  const { data } = await drive.files.list({
    q,
    pageSize,
    pageToken: pageToken || undefined,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    orderBy: "folder,name",
    fields:
      "nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink, parents, owners, shared)",
  });

  return {
    files: data.files ?? [],
    nextPageToken: data.nextPageToken,
  };
}

export async function createFolderInDrive(
  storageAccountId: string,
  folderName: string,
  parentFolderId?: string
) {
  const drive = await getGoogleDriveClient(storageAccountId);
  const requestBody: { name: string; mimeType: string; parents?: string[] } = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };
  if (parentFolderId) {
    requestBody.parents = [parentFolderId];
  }

  const { data } = await drive.files.create({
    requestBody,
    fields: "id, name, mimeType, webViewLink, createdTime",
  });

  return data;
}

export async function uploadFileToDrive(
  storageAccountId: string,
  file: {
    name: string;
    mimeType: string;
    buffer: Buffer;
    size: number;
    parentFolderId?: string;
  }
) {
  const drive = await getGoogleDriveClient(storageAccountId);
  const { Readable } = await import("stream");

  const requestBody: { name: string; mimeType: string; parents?: string[] } = {
    name: file.name,
    mimeType: file.mimeType,
  };
  if (file.parentFolderId) {
    requestBody.parents = [file.parentFolderId];
  }

  const { data } = await drive.files.create({
    requestBody,
    media: {
      mimeType: file.mimeType,
      body: Readable.from(file.buffer),
    },
    fields: "id, name, size, webViewLink, mimeType, parents",
  });

  return data;
}

export async function deleteFileFromDrive(
  storageAccountId: string,
  providerFileId: string
) {
  const drive = await getGoogleDriveClient(storageAccountId);
  await drive.files.delete({ fileId: providerFileId });
}

export async function renameFileInDrive(
  storageAccountId: string,
  providerFileId: string,
  newName: string
) {
  const drive = await getGoogleDriveClient(storageAccountId);
  const { data } = await drive.files.update({
    fileId: providerFileId,
    requestBody: {
      name: newName,
    },
    fields: "id, name",
  });
  return data;
}

export async function moveFileInDrive(
  storageAccountId: string,
  providerFileId: string,
  newParentId: string
) {
  const drive = await getGoogleDriveClient(storageAccountId);
  // Retrieve previous parents
  const file = await drive.files.get({
    fileId: providerFileId,
    fields: "parents",
  });
  const previousParents = (file.data.parents || []).join(",");

  const targetParent = newParentId === "root" ? "root" : newParentId;

  const { data } = await drive.files.update({
    fileId: providerFileId,
    addParents: targetParent,
    removeParents: previousParents || undefined,
    fields: "id, name, parents",
  });
  return data;
}

export async function downloadFileStream(
  storageAccountId: string,
  providerFileId: string,
  mimeType?: string
) {
  const drive = await getGoogleDriveClient(storageAccountId);

  // If it's a native Google Docs / Sheets / Slides file, export it
  if (mimeType === "application/vnd.google-apps.document") {
    const res = await drive.files.export(
      {
        fileId: providerFileId,
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
      { responseType: "stream" }
    );
    return {
      stream: res.data,
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      extension: ".docx",
    };
  }

  if (mimeType === "application/vnd.google-apps.spreadsheet") {
    const res = await drive.files.export(
      {
        fileId: providerFileId,
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
      { responseType: "stream" }
    );
    return {
      stream: res.data,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      extension: ".xlsx",
    };
  }

  if (mimeType === "application/vnd.google-apps.presentation") {
    const res = await drive.files.export(
      {
        fileId: providerFileId,
        mimeType:
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      },
      { responseType: "stream" }
    );
    return {
      stream: res.data,
      mimeType:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      extension: ".pptx",
    };
  }

  // Standard binary file download
  const res = await drive.files.get(
    {
      fileId: providerFileId,
      alt: "media",
    },
    { responseType: "stream" }
  );

  return {
    stream: res.data,
    mimeType: mimeType || "application/octet-stream",
  };
}

export async function getUserInfo(accessToken: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();
  return data;
}

