export default function Empty({ label }: { label: string }) {
  return (
    <div className="col-span-full rounded-[2rem] bg-card p-12 text-center text-muted-foreground">
      {label}
    </div>
  );
}
