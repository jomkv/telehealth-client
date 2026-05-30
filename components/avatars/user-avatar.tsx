"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/helpers/format";

type UserAvatarProps = {
  name?: string | null;
  src?: string | null;
  alt?: string | null;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
};

export function UserAvatar({
  name,
  src,
  alt,
  className,
  imageClassName,
  fallbackClassName,
}: UserAvatarProps) {
  const fallbackText = name?.trim() ? initials(name) : "U";

  return (
    <Avatar className={className}>
      {src ? (
        <AvatarImage
          src={src}
          alt={alt ?? name ?? "User avatar"}
          className={imageClassName}
        />
      ) : null}
      <AvatarFallback className={fallbackClassName}>
        {fallbackText}
      </AvatarFallback>
    </Avatar>
  );
}
