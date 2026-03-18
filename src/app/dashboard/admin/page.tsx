import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import { getDashboardContent } from "@/features/dashboard/data/dashboard-content";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { fetchInstitutionUsers } from "@/services/admin/fetch-institution-users";
import { requireDashboardProfile } from "@/services/auth/require-dashboard-profile";
import { fetchModuleCounts } from "@/services/db/modules";

const adminSections = [
  {
    href: "#equipe",
    label: "Equipe",
    description: "Centro da pagina com a lista institucional."
  },
  {
    href: "#novo-usuario",
    label: "Novo usuario",
    description: "Criacao e convite por modal."
  },
  {
    href: "#permissoes",
    label: "Regras",
    description: "Papel, ano e progressao natural."
  },
  {
    href: "#contexto",
    label: "Contexto",
    description: "Tenant atual e indicadores essenciais."
  }
] as const;

export default async function AdminDashboardPage() {
  const profile = await requireDashboardProfile("admin");
  const moduleCounts = await fetchModuleCounts(profile.institution_id);
  const users = await fetchInstitutionUsers(profile.institution_id);
  const content = getDashboardContent("admin", profile, moduleCounts ?? undefined);

  return (
    <AdminWorkspace
      heading={content.heading}
      intro="Workspace administrativo com barra lateral forte e alternancia clara/escura para a operacao institucional."
      institutionName={profile.institution_name}
      institutionId={profile.institution_id}
      currentUserId={profile.id}
      users={users}
      stats={content.stats}
      isAdminConfigured={isSupabaseAdminConfigured()}
      sections={adminSections}
    />
  );
}
