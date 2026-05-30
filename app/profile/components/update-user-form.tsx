import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MeUser } from "@/@types/user";
import { useUserStore } from "@/app/store";
import { formatIsoDate } from "@/lib/helpers/format";
import { toast } from "sonner";

const updateUserSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),

  name: z
    .string()
    .min(1, "Name must be at least 1 character")
    .max(100, "Name must be at most 100 characters")
    .optional()
    .or(z.literal("")),

  // type="date" gives YYYY-MM-DD which is valid ISO; we just sanity-check it
  birthday: z
    .string()
    .refine(
      (v) => !v || !isNaN(Date.parse(v)),
      "Birthday must be a valid ISO date string (e.g. 1990-06-15)",
    )
    .optional()
    .or(z.literal("")),

  mobileNumber: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits")
    .optional()
    .or(z.literal("")),

  profilePic: z
    .custom<FileList>()
    .refine(
      (files) => !files || files.length <= 1,
      "Only one profile picture is allowed",
    )
    .refine(
      (files) =>
        !files || files.length === 0 || files[0].type.startsWith("image/"),
      "File must be an image",
    )
    .refine(
      (files) =>
        !files || files.length === 0 || files[0].size <= 5 * 1024 * 1024,
      "File must be 5MB or smaller",
    )
    .optional(),
});

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export interface UpdateUserInput {
  password?: string;
  name?: string;
  birthday?: string; // ISO date string
  profilePic?: File;
  mobileNumber?: string;
}

/**
 * Strips empty strings and empty FileLists so the payload only contains
 * fields the user actually filled in.
 */
function buildPayload(values: UpdateUserFormValues): UpdateUserInput {
  const payload: UpdateUserInput = {};
  if (values.password) payload.password = values.password;
  if (values.name) payload.name = values.name;
  if (values.birthday) payload.birthday = values.birthday;
  if (values.mobileNumber) payload.mobileNumber = values.mobileNumber;
  if (values.profilePic && values.profilePic.length > 0)
    payload.profilePic = values.profilePic[0];
  return payload;
}

interface UpdateUserFormProps {
  onSubmit?: (payload: UpdateUserInput) => void | Promise<MeUser>;
  isLoading?: boolean;
}

export function UpdateUserForm({
  onSubmit,
  isLoading = false,
}: UpdateUserFormProps) {
  const user = useUserStore((s) => s.user);

  const {
    control,
    handleSubmit,
    setError,
    resetField,
    formState: { errors },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      password: undefined,
      name: user?.name ?? undefined,
      birthday:
        user && user?.birthday ? formatIsoDate(user.birthday) : undefined,
      mobileNumber: user?.mobileNumber ?? undefined,
      profilePic: undefined,
    },
  });

  async function handleFormSubmit(values: UpdateUserFormValues) {
    const payload = buildPayload(values);

    if (Object.keys(payload).length === 0) {
      setError("root", { message: "No fields were changed." });
      return;
    }

    await onSubmit?.(payload);
    toast.success("Profile updated");
    resetField("profilePic");
    resetField("password");
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      encType="multipart/form-data"
      noValidate
    >
      <FieldSet>
        {/* Root-level error (e.g. "nothing changed") */}
        {errors.root && (
          <p className="text-sm text-destructive">{errors.root.message}</p>
        )}

        <FieldGroup>
          {/* ── Name ───────────────────────────────────────── */}
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  placeholder={user?.name ?? "Jane Doe"}
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          {/* ── Password ───────────────────────────────────── */}
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                {fieldState.error ? (
                  <FieldError>{fieldState.error.message}</FieldError>
                ) : (
                  <FieldDescription>
                    Leave blank to keep current password.
                  </FieldDescription>
                )}
              </Field>
            )}
          />

          {/* ── Birthday ───────────────────────────────────── */}
          <Controller
            control={control}
            name="birthday"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="birthday">Birthday</FieldLabel>
                {/* type="date" produces YYYY-MM-DD — valid ISO */}
                <Input
                  id="birthday"
                  type="date"
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          {/* ── Mobile Number ──────────────────────────────── */}
          <Controller
            control={control}
            name="mobileNumber"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="mobileNumber">Mobile Number</FieldLabel>
                <Input
                  id="mobileNumber"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit number"
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                {fieldState.error ? (
                  <FieldError>{fieldState.error.message}</FieldError>
                ) : (
                  <FieldDescription>
                    Digits only, exactly 10 characters.
                  </FieldDescription>
                )}
              </Field>
            )}
          />

          {/* ── Profile Picture ────────────────────────────── */}
          <Controller
            control={control}
            name="profilePic"
            render={({
              field: { onChange, value: _value, ...rest },
              fieldState,
            }) => (
              <Field>
                <FieldLabel htmlFor="profilePic">Profile Picture</FieldLabel>
                <Input
                  id="profilePic"
                  type="file"
                  accept="image/*"
                  // no `multiple` — single file only at browser level too
                  aria-invalid={!!fieldState.error}
                  onChange={(e) => onChange(e.target.files)}
                  {...rest}
                />
                {fieldState.error ? (
                  <FieldError>{fieldState.error.message}</FieldError>
                ) : (
                  <FieldDescription>
                    Leave blank to keep current profile picture.
                  </FieldDescription>
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving…" : "Save Changes"}
        </Button>
      </FieldSet>
    </form>
  );
}
