<?php

namespace ClarkWinkelmann\FeaturedDiscussions\Filter;

use Carbon\Carbon;
use ClarkWinkelmann\FeaturedDiscussions\Scheduler;
use Flarum\Filter\FilterInterface;
use Flarum\Filter\FilterState;

/**
 * This filter is used to retrieve all scheduled posts for the schedule page
 * This includes currently active features as well as future
 */
class ScheduledFilter implements FilterInterface
{
    protected $scheduler;

    public function __construct(Scheduler $scheduler)
    {
        $this->scheduler = $scheduler;
    }

    public function getFilterKey(): string
    {
        return 'featureScheduled';
    }

    public function filter(FilterState $filterState, string $filterValue, bool $negate)
    {
        $filterState->getActor()->assertCan('discussion.feature');

        $older = Carbon::now()->subSeconds($this->scheduler->getDefaultDuration());

        $filterState->getQuery()
            ->whereNotNull('featured_from')
            ->where('featured_from', '>', $older);
    }
}
