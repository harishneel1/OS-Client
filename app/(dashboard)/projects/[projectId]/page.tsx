import { ProjectView } from "../../../../components/projects/ProjectView";

interface ProjectPageProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  return <ProjectView projectId={projectId} />;
}
