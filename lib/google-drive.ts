import { google } from "googleapis";
import { decrypt, encrypt } from "@/lib/encryption";
import { db } from "@/lib/db";

const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export function getGoogleRedirectUri(): string {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  return `${base}/api/google/callback`;
}

export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getGoogleRedirectUri()
  );
}

export function getAuthorizationUrl(state?: string, loginHint?: string): string {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent select_account",
    login_hint: loginHint,
    state,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function getValidAccessToken(storageAccountId: string): Promise<string> {
  const account = await db.storageAccount.findUnique({
    where: { id: storageAccountId },
  });
  if (!account) throw new Error("Storage account not found");

  const oauth2Client = createOAuth2Client();
  let accessToken = "";
  if (account.accessTokenEnc) {
    try {
      accessToken = decrypt(account.accessTokenEnc);
    } catch (e) {
      console.warn("Failed to decrypt accessTokenEnc:", e);
    }
  }
  let refreshToken = "";
  if (account.refreshTokenEnc) {
    try {
      refreshToken = decrypt(account.refreshTokenEnc);
    } catch (e) {
      console.warn("Failed to decrypt refreshTokenEnc:", e);
    }
  }

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: account.tokenExpiresAt?.getTime(),
  });

  oauth2Client.on("tokens", async (newTokens) => {
    if (newTokens.access_token) {
      await db.storageAccount
        .update({
          where: { id: storageAccountId },
          data: {
            accessTokenEnc: encrypt(newTokens.access_token),
            refreshTokenEnc: newTokens.refresh_token
              ? encrypt(newTokens.refresh_token)
              : undefined,
            tokenExpiresAt: newTokens.expiry_date
              ? new Date(newTokens.expiry_date)
              : undefined,
          },
        })
        .catch((e) => console.error("Error saving refreshed token:", e));
    }
  });

  const res = await oauth2Client.getAccessToken();
  if (!res.token) {
    throw new Error("Could not acquire a valid Google access token");
  }
  return res.token;
}

export async function createResumableUploadSession(
  storageAccountId: string,
  params: {
    name: string;
    mimeType: string;
    size?: number;
    parentFolderId?: string;
    origin?: string;
  }
): Promise<{ uploadUrl: string; storageAccountId: string }> {
  const token = await getValidAccessToken(storageAccountId);

  const requestBody: { name: string; mimeType: string; parents?: string[] } = {
    name: params.name,
    mimeType: params.mimeType || "application/octet-stream",
  };
  if (params.parentFolderId && params.parentFolderId !== "root") {
    requestBody.parents = [params.parentFolderId];
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json; charset=UTF-8",
    "X-Upload-Content-Type": params.mimeType || "application/octet-stream",
  };

  if (params.size && params.size > 0) {
    headers["X-Upload-Content-Length"] = params.size.toString();
  }

  if (params.origin) {
    headers["Origin"] = params.origin;
  }

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
    {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Google Drive Resumable Session init failed (${res.status}): ${errorText}`
    );
  }

  const uploadUrl = res.headers.get("location");
  if (!uploadUrl) {
    throw new Error("Google Drive did not return a resumable upload location.");
  }

  return { uploadUrl, storageAccountId };
}

export async function getGoogleDriveClient(storageAccountId: string) {
  const account = await db.storageAccount.findUnique({
    where: { id: storageAccountId },
  });

  if (!account) throw new Error("Storage account not found");

  const oauth2Client = createOAuth2Client();
  let accessToken = "";
  try {
    if (account.accessTokenEnc) {
      accessToken = decrypt(account.accessTokenEnc);
    }
  } catch (e) {
    console.warn("Failed to decrypt accessTokenEnc:", e);
  }

  let refreshToken = "";
  try {
    if (account.refreshTokenEnc) {
      refreshToken = decrypt(account.refreshTokenEnc);
    }
  } catch (e) {
    console.warn("Failed to decrypt refreshTokenEnc:", e);
  }

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: account.tokenExpiresAt?.getTime(),
  });

  // Auto-refresh token listener when googleapis performs internal refresh
  oauth2Client.on("tokens", async (newTokens) => {
    if (newTokens.access_token) {
      const updateData: {
        accessTokenEnc: string;
        refreshTokenEnc?: string;
        tokenExpiresAt?: Date;
      } = {
        accessTokenEnc: encrypt(newTokens.access_token),
        tokenExpiresAt: newTokens.expiry_date
          ? new Date(newTokens.expiry_date)
          : undefined,
      };

      if (newTokens.refresh_token) {
        updateData.refreshTokenEnc = encrypt(newTokens.refresh_token);
      }

      await db.storageAccount
        .update({
          where: { id: storageAccountId },
          data: updateData,
        })
        .catch((e) => console.error("Error updating refreshed tokens:", e));
    }
  });

  return google.drive({ version: "v3", auth: oauth2Client });
}

/**
 * Explicitly refreshes the Google OAuth access token for a storage account.
 * Triggered on-demand when the user clicks the "Sinkron" button.
 */
export async function refreshAccountAccessToken(storageAccountId: string): Promise<string> {
  const account = await db.storageAccount.findUnique({
    where: { id: storageAccountId },
    include: {
      user: {
        include: {
          accounts: {
            where: { providerId: "google" },
          },
        },
      },
    },
  });

  if (!account) throw new Error("Storage account not found");

  let refreshToken = "";
  if (account.refreshTokenEnc) {
    try {
      refreshToken = decrypt(account.refreshTokenEnc);
    } catch (e) {
      console.warn("Failed to decrypt refreshTokenEnc:", e);
    }
  }

  // Fallback to user's primary login account if storageAccount lacks refresh token
  if (!refreshToken) {
    const primaryGoogleAccount = account.user?.accounts?.[0];
    if (primaryGoogleAccount?.refreshToken) {
      refreshToken = primaryGoogleAccount.refreshToken;
    }
  }

  if (!refreshToken) {
    throw new Error(
      "Refresh token tidak tersedia. Pastikan akun Google telah dihubungkan dengan izin offline."
    );
  }

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { credentials } = await oauth2Client.refreshAccessToken();
  if (!credentials.access_token) {
    throw new Error("Gagal memperoleh access token baru dari Google.");
  }

  const updateData: {
    accessTokenEnc: string;
    refreshTokenEnc?: string;
    tokenExpiresAt?: Date;
  } = {
    accessTokenEnc: encrypt(credentials.access_token),
    tokenExpiresAt: credentials.expiry_date
      ? new Date(credentials.expiry_date)
      : new Date(Date.now() + 3600 * 1000),
  };

  if (credentials.refresh_token) {
    updateData.refreshTokenEnc = encrypt(credentials.refresh_token);
  } else if (!account.refreshTokenEnc && refreshToken) {
    updateData.refreshTokenEnc = encrypt(refreshToken);
  }

  await db.storageAccount.update({
    where: { id: storageAccountId },
    data: updateData,
  });

  return credentials.access_token;
}

export function isInvalidGrantError(err: unknown): boolean {
  const e = err as {
    message?: string;
    response?: { data?: { error?: string; error_description?: string } };
  };
  return (
    Boolean(e?.message?.includes("invalid_grant")) ||
    e?.response?.data?.error === "invalid_grant" ||
    Boolean(e?.response?.data?.error_description?.includes("expired or revoked"))
  );
}

export async function getStorageQuota(
  storageAccountId: string,
  options?: { forceRefresh?: boolean }
) {
  try {
    if (options?.forceRefresh) {
      await refreshAccountAccessToken(storageAccountId).catch((refreshErr) => {
        console.warn("On-demand token refresh before quota fetch:", refreshErr);
      });
    }

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
  } catch (err) {
    // If getting quota failed due to token issues and forceRefresh was not already run, retry with refresh
    if (!options?.forceRefresh && isInvalidGrantError(err)) {
      try {
        await refreshAccountAccessToken(storageAccountId);
        const retryDrive = await getGoogleDriveClient(storageAccountId);
        const { data: retryData } = await retryDrive.about.get({
          fields: "storageQuota,user",
        });
        const quota = retryData.storageQuota;
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
          user: retryData.user,
        };
      } catch (retryErr) {
        if (isInvalidGrantError(retryErr)) {
          throw new Error(
            "Token Google Drive telah kadaluarsa (invalid_grant). Pastikan project Google Cloud Console telah disetel ke 'In production' (Publish App), lalu sambungkan ulang akun sekali untuk mendapatkan token permanen."
          );
        }
        throw retryErr;
      }
    }

    if (isInvalidGrantError(err)) {
      throw new Error(
        "Token Google Drive telah kadaluarsa (invalid_grant). Pastikan project Google Cloud Console telah disetel ke 'In production' (Publish App), lalu sambungkan ulang akun sekali untuk mendapatkan token permanen."
      );
    }
    throw err;
  }
}

export async function listFiles(
  storageAccountId: string,
  options: {
    query?: string;
    pageSize?: number;
    pageToken?: string;
    folderId?: string;
    scope?: "all" | "mydrive" | "sharedWithMe";
  } = {}
) {
  try {
    const drive = await getGoogleDriveClient(storageAccountId);
    const { query, pageSize = 50, pageToken, folderId, scope = "all" } = options;

    let q = "trashed = false";
    if (folderId && folderId !== "root") {
      q += ` and '${folderId}' in parents`;
    } else if (scope === "sharedWithMe") {
      q += " and sharedWithMe = true";
    } else if (scope === "mydrive") {
      q += " and 'root' in parents";
    } else {
      // Default "all": Tampilkan file di root akun sendiri ATAU file yang dibagikan oleh siapa pun ke akun ini
      q += " and ('root' in parents or sharedWithMe = true)";
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
        "nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink, parents, owners, shared, sharingUser)",
    });

    return {
      files: data.files ?? [],
      nextPageToken: data.nextPageToken,
    };
  } catch (err) {
    if (isInvalidGrantError(err)) {
      throw new Error(
        "Token Google Drive telah kadaluarsa (invalid_grant). Pastikan project Google Cloud Console telah disetel ke 'In production' (Publish App), lalu sambungkan ulang akun sekali untuk mendapatkan token permanen."
      );
    }
    throw err;
  }
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

