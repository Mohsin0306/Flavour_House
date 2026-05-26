import type { Restaurant } from "@/lib/api";
import { formatDistance } from "@/lib/format";

type Props = {
  branch: Restaurant;
};

export default function NearestBranchBanner({ branch }: Props) {
  return (
    <div className="mx-4 mb-2 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg">
          📍
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
            Your nearest branch
          </p>
          <h2 className="mt-0.5 text-base font-bold text-neutral-900">
            {branch.city ? `${branch.city} Branch` : branch.name}
          </h2>
          <p className="text-xs text-neutral-500">{branch.name}</p>
          <p className="mt-1 text-xs text-neutral-600">{branch.address}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {branch.distance_km != null && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                {formatDistance(branch.distance_km)}
              </span>
            )}
            {branch.cuisine && (
              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600">
                {branch.cuisine}
              </span>
            )}
            {branch.phone && (
              <a
                href={`tel:${branch.phone}`}
                className="rounded-full bg-neutral-900 px-2.5 py-0.5 text-xs font-medium text-white"
              >
                Call branch
              </a>
            )}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-neutral-500">
            Menu and offers below are for this branch. We matched you here because you are closest
            to this location.
          </p>
        </div>
      </div>
    </div>
  );
}
