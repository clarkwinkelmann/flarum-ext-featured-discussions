<?php

namespace ClarkWinkelmann\FeaturedDiscussions\Filter;

use Carbon\Carbon;
use ClarkWinkelmann\FeaturedDiscussions\Scheduler;
use Flarum\Filter\FilterInterface;
use Flarum\Filter\FilterState;
use Illuminate\Database\Query\Builder;

class FeaturedFilter implements FilterInterface
{
    protected $scheduler;

    public function __construct(Scheduler $scheduler)
    {
        $this->scheduler = $scheduler;
    }

    public function getFilterKey(): string
    {
        return 'featured';
    }

    public function filter(FilterState $filterState, string $filterValue, bool $negate)
    {
        $filterState->getQuery()
            ->whereNotNull('featured_from')
            ->where('featured_from', '<', Carbon::now())
            ->where(function (Builder $query) {
                $query->whereNull('featured_until')
                    ->where('featured_from', '>', Carbon::now()->subSeconds($this->scheduler->getDefaultDuration()));
            });

        $filterState->setDefaultSort(function (Builder $query) {
            $query->orderBy('featured_from', 'desc');
        });
    }
}
