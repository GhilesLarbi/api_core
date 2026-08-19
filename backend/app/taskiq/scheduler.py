import asyncio

from taskiq.cli.scheduler.args import SchedulerArgs
from taskiq.cli.scheduler.run import run_scheduler


#########################################################################################################
#########################################################################################################
if __name__ == "__main__":
    asyncio.run(
        run_scheduler(
            args=SchedulerArgs(
                scheduler="app.taskiq.main:scheduler",
                modules=["app.taskiq.tasks.user_tasks"],
            )
        )
    )
