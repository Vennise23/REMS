<?php

namespace App\Console;

use App\Http\Controllers\FileController;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
       // Schedule the delete task to run every 2 minutes
       $schedule->call(function () {
        FileController::scheduleDelete();
    })->everyTwoMinutes();
        $schedule->command('properties:delete-expired')->daily();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
