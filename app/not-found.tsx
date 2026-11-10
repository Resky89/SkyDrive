"use client";

import { ErrorOne } from "@/components/ui/error-1";
import { useLanguage } from "@/lib/i18n";
import { RiHome5Fill, RiDashboardFill } from "react-icons/ri";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <ErrorOne
      code="404"
      title={t.notFoundTitle}
      description={t.notFoundDesc}
      action={{
        label: t.notFoundCtaDashboard,
        href: "/dashboard",
        icon: <RiDashboardFill className="ml-1.5 text-base" aria-hidden="true" />,
      }}
      secondaryAction={{
        label: t.notFoundCtaHome,
        href: "/",
        icon: <RiHome5Fill className="ml-1.5 text-base" aria-hidden="true" />,
      }}
    />
  );
}
