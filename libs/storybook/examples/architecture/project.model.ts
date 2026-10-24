export interface Project {
  readonly id: string;
  readonly name: string;
  readonly status: 'draft' | 'published';
  readonly version: number;
  readonly updatedAt: string;
}

export interface CreateProject {
  readonly name: string;
}
export interface UpdateProject {
  readonly name: string;
}

export interface ProjectDto {
  readonly id: string;
  readonly title: string;
  readonly status: 'draft' | 'published';
  readonly version: number;
  readonly updated_at: string;
}

export interface ProjectPageDto {
  readonly items: readonly ProjectDto[];
  readonly nextCursor: string | null;
}
export interface ProjectPage {
  readonly items: readonly Project[];
  readonly nextCursor: string | null;
}

export function fromProjectDto(dto: ProjectDto): Project {
  return {
    id: dto.id,
    name: dto.title,
    status: dto.status,
    version: dto.version,
    updatedAt: dto.updated_at,
  };
}
