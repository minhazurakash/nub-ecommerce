import {
  ProfileForm,
  type ProfileFormValues,
} from "@/components/account/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateProfile } from "@/modules/account/actions";
import { getUserProfile } from "@/modules/account/queries";
import { getCurrentUser } from "@/modules/auth/actions";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await getUserProfile(user.id);
  if (!profile) return null;

  async function saveProfile(values: ProfileFormValues) {
    "use server";

    const result = await updateProfile({
      name: values.name,
      phone: values.phone || undefined,
    });

    if (!result.success) {
      throw new Error(result.error);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-poppins)] text-xl font-semibold tracking-tight sm:text-2xl">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Update your personal information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal details</CardTitle>
          <CardDescription>
            Manage your name and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultValues={{
              name: profile.name ?? "",
              phone: profile.phone ?? "",
              avatarUrl: profile.avatarUrl,
            }}
            email={profile.email}
            onSubmit={saveProfile}
          />
        </CardContent>
      </Card>
    </div>
  );
}
