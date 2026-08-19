from app.core.settings import settings, Environment

from taskiq.cli.worker.args import WorkerArgs
from taskiq.cli.worker.run import run_worker


#########################################################################################################
#########################################################################################################
if __name__ == "__main__":
    run_worker(
        args=WorkerArgs(
            broker="app.taskiq.main:broker",
            modules=["app.taskiq.tasks.user_tasks"],
            workers=settings.TASKIQ_WORKERS,
            reload=settings.ENVIRONMENT not in (Environment.PRODUCTION, Environment.STAGING),
            reload_dirs=["app"],
        )
    )
