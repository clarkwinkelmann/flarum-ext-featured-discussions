<?php

namespace ClarkWinkelmann\FeaturedDiscussions;

use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Discussion\Discussion;

class DiscussionAttributes
{
    protected $scheduler;

    public function __construct(Scheduler $scheduler)
    {
        $this->scheduler = $scheduler;
    }

    public function __invoke(DiscussionSerializer $serializer, Discussion $discussion): array
    {
        $canFeature = $serializer->getActor()->can('feature', $discussion);

        if (is_null($discussion->featured_from)) {
            return [
                'canFeature' => $canFeature,
            ];
        }

        $until = $discussion->featured_until ?? $discussion->featured_from->addSeconds($this->scheduler->getDefaultDuration());

        $attributes = [
            'canFeature' => $canFeature,
            'isFeatured' => $discussion->featured_from->isPast() && $until->isFuture(),
            'featuredFrom' => $serializer->formatDate($discussion->featured_from),
            'featuredUntil' => $until,
        ];

        if ($canFeature) {
            $attributes['featuredUntilEdit'] = $serializer->formatDate($discussion->featured_until);
        }

        return $attributes;
    }
}
