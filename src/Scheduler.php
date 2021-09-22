<?php

namespace ClarkWinkelmann\FeaturedDiscussions;

use Carbon\Carbon;
use Cron\CronExpression;
use DateTime;
use Exception;
use Flarum\Discussion\Discussion;
use Flarum\Settings\SettingsRepositoryInterface;

class Scheduler
{
    protected $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    protected function getCron(): CronExpression
    {
        $cron = new CronExpression($this->settings->get('featured-discussions.schedule') ?: '0 0 1 * *');

        // Apparently the default value doesn't allow values like once per month
        $cron->setMaxIterationCount(10000);

        return $cron;
    }

    /**
     * Shortcut to generate 50 dates
     * @return DateTime[]
     * @throws Exception
     */
    protected function getNextDates($currentTime = 'now'): array
    {
        return $this->getCron()->getMultipleRunDates(50, $currentTime);
    }

    public function getNextUnusedDate(): DateTime
    {
        $usedDates = Discussion::query()
            ->where('featured_from', '>', Carbon::now())
            ->orderBy('featured_from')
            ->pluck('featured_from');

        $dates = $this->getNextDates();

        foreach ($dates as $date) {
            $carbon = Carbon::instance($date);

            foreach ($usedDates as $used) {
                if ($carbon->eq($used)) {
                    continue 2;
                }
            }

            return $date;
        }

        throw new \Exception('All the dates are already used');
    }

    /**
     * Duration in seconds
     * @return int
     */
    public function getDefaultDuration(): int
    {
        return (int)$this->settings->get('featured-discussions.duration') ?: 2678400;
    }

    /**
     * Generates a list of time slots starting from the earlier that might still be visible
     * Used for the schedule page
     * @return DateTime[]
     * @throws Exception
     */
    public function getSchedulableDates(): array
    {
        $date = Carbon::now()->subSeconds($this->getDefaultDuration());

        return $this->getNextDates($date);
    }
}
