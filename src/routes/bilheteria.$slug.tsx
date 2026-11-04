import { createFileRoute, Outlet, notFound } from "@tanstack/react-router";
import { getMovie } from "@/data/movies";

export const Route = createFileRoute("/bilheteria/$slug")({
  loader: ({ params }) => {
    const movie = getMovie(params.slug);
    if (!movie) throw notFound();
    return { movie };
  },
  component: BilheteriaLayout,
});

function BilheteriaLayout() {
  return <Outlet />;
}
