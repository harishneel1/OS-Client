import { ProjectView } from "../../../../components/projects/ProjectView";

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = params;

  return <ProjectView projectId={id} />;
}
