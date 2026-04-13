import {
  BriefcaseBusiness,
  FileText,
  LayoutGrid,
  Mail,
  Play,
  UserRound,
} from "lucide-react";
import { GridCard } from "@/components/grid";
import { cn } from "@/lib/utils";
import {
  lyovsonActivitiesRoute,
  lyovsonBioRoute,
  lyovsonContactRoute,
  lyovsonNotesRoute,
  lyovsonPortfolioRoute,
  lyovsonPostsRoute,
  lyovsonRoute,
} from "@/utilities/routes";
import { GridCardNavItem } from "../nav";

interface GridCardLyovsonSectionsProps {
  className?: string;
  username: string;
}

export function GridCardLyovsonSections({
  username,
  className,
}: GridCardLyovsonSectionsProps) {
  return (
    <GridCard
      className={cn(
        "col-start-1 col-end-2 row-start-2 row-end-3 self-start",
        className
      )}
      interactive={false}
    >
      <GridCardNavItem
        className="col-start-1 col-end-2 row-start-1 row-end-2"
        href={lyovsonRoute(username)}
        variant="link"
      >
        <LayoutGrid className="h-6 w-6" />
        <span>All</span>
      </GridCardNavItem>

      <GridCardNavItem
        className="col-start-2 col-end-3 row-start-1 row-end-2"
        href={lyovsonPostsRoute(username)}
        variant="link"
      >
        <FileText className="h-6 w-6" />
        <span>Posts</span>
      </GridCardNavItem>

      <GridCardNavItem
        className="col-start-3 col-end-4 row-start-1 row-end-2"
        href={lyovsonNotesRoute(username)}
        variant="link"
      >
        <FileText className="h-6 w-6" />
        <span>Notes</span>
      </GridCardNavItem>

      <GridCardNavItem
        className="col-start-1 col-end-2 row-start-2 row-end-3"
        href={lyovsonActivitiesRoute(username)}
        variant="link"
      >
        <Play className="h-6 w-6" />
        <span>Activities</span>
      </GridCardNavItem>

      <GridCardNavItem
        className="col-start-2 col-end-3 row-start-2 row-end-3"
        href={lyovsonBioRoute(username)}
        variant="link"
      >
        <UserRound className="h-6 w-6" />
        <span>Bio</span>
      </GridCardNavItem>

      <GridCardNavItem
        className="col-start-3 col-end-4 row-start-2 row-end-3"
        href={lyovsonPortfolioRoute(username)}
        variant="link"
      >
        <BriefcaseBusiness className="h-6 w-6" />
        <span>Portfolio</span>
      </GridCardNavItem>

      <GridCardNavItem
        className="col-start-1 col-end-2 row-start-3 row-end-4"
        href={lyovsonContactRoute(username)}
        variant="link"
      >
        <Mail className="h-6 w-6" />
        <span>Contact</span>
      </GridCardNavItem>

      <GridCardNavItem
        className="col-start-2 col-end-3 row-start-3 row-end-4 opacity-50"
        variant="static"
      >
        <span>Soon</span>
      </GridCardNavItem>

      <GridCardNavItem
        className="col-start-3 col-end-4 row-start-3 row-end-4 opacity-50"
        variant="static"
      >
        <span>Soon</span>
      </GridCardNavItem>
    </GridCard>
  );
}
