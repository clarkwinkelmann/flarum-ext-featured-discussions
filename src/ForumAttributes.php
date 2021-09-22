<?php

namespace ClarkWinkelmann\FeaturedDiscussions;

use Flarum\Api\Serializer\ForumSerializer;

class ForumAttributes
{
    protected $scheduler;

    public function __construct(Scheduler $scheduler)
    {
        $this->scheduler = $scheduler;
    }

    public function __invoke(ForumSerializer $serializer): array
    {
        if (!$serializer->getActor()->hasPermission('discussion.feature')) {
            return [];
        }

        return [
            'showSchedulePage' => true,
            'featureDiscussionsSchedule' => array_map(function ($date) use ($serializer) {
                return $serializer->formatDate($date);
            }, $this->scheduler->getSchedulableDates()),
        ];
    }
}
