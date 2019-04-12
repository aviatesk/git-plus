import { GitRepository } from "atom";
import { logger, RecordAttributes } from "../activity-logger";
import { Repository } from "../repository";

export abstract class RepositoryCommand<P> {
  async invoke(args: P, repoArg?: Repository | GitRepository) {
    let repo: Repository;

    if (repoArg === undefined) {
      const r = await Repository.getCurrent();
      if (r === undefined) return atom.notifications.addInfo("No repository found");
      repo = r;
    } else if (repoArg instanceof GitRepository) {
      repo = new Repository(repoArg);
    }

    const result = await this.execute(repo!, args);
    if (result) logger.record(result);
  }

  protected abstract execute(repo: Repository, params: P): Promise<RecordAttributes | void> | void;
}

export namespace Editor {
  export function getCurrentFileInRepo(repo: Repository): string | undefined {
    const activeEditor = atom.workspace.getActiveTextEditor();
    const path = activeEditor && activeEditor.getPath();
    if (!path) return undefined;
    return repo.relativize(path);
  }
}
