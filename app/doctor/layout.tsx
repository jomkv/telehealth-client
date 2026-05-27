import { RoleRouteGuard } from "@/components/auth/role-route-guard";

export default function DoctorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RoleRouteGuard allowedRole="DOCTOR">{children}</RoleRouteGuard>;
}
