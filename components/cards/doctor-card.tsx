import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { PopulatedDoctor } from "@/@types/doctor";
import { UserAvatar } from "../avatars/user-avatar";

export function DoctorCard({ doctor }: { doctor: PopulatedDoctor }) {
  return (
    <Link
      href={`/patient/doctors/${doctor.id}`}
      className="group relative block rounded-[2.5rem] bg-card p-8 transition hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-start gap-6">
        <UserAvatar
          name={doctor.user.name}
          src={doctor.user.profilePic}
          className="h-24 w-24 ring-1 ring-border"
          fallbackClassName="bg-muted text-xl"
        />
        <div className="flex-1">
          <Eyebrow>{doctor.specialization.label}</Eyebrow>
          <h3 className="mt-2 text-2xl">{doctor.user.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {doctor.yearsOfPractice != null
              ? `${doctor.yearsOfPractice} years of practice`
              : "Experience not listed"}
          </p>
          {doctor.bio && (
            <p className="mt-3 line-clamp-2 text-sm text-foreground/80">
              {doctor.bio}
            </p>
          )}
        </div>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-foreground text-background transition group-hover:scale-110">
          <ArrowUpRight className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
}
