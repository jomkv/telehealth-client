import { RoleRouteGuard } from "@/components/auth/role-route-guard";

export default function PatientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RoleRouteGuard allowedRole="PATIENT">{children}</RoleRouteGuard>;
}
