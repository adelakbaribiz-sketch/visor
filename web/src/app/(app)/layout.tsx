import { AppShell } from "@/components/AppShell";

export default function AppGroupLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
