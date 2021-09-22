<?php

namespace ClarkWinkelmann\FeaturedDiscussions\Listener;

use Carbon\Carbon;
use ClarkWinkelmann\FeaturedDiscussions\Post\FeaturedPost;
use ClarkWinkelmann\FeaturedDiscussions\Scheduler;
use Flarum\Discussion\Discussion;
use Flarum\Discussion\Event\Saving;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Support\Arr;

class SaveDiscussion
{
    protected $scheduler;
    protected $settings;

    public function __construct(Scheduler $scheduler, SettingsRepositoryInterface $settings)
    {
        $this->scheduler = $scheduler;
        $this->settings = $settings;
    }

    public function handle(Saving $event)
    {
        $attributes = (array)Arr::get($event->data, 'attributes');

        $updated = false;

        if (Arr::exists($attributes, 'featuredFrom')) {
            $event->actor->assertCan('feature', $event->discussion);

            $value = Arr::get($attributes, 'featuredFrom');

            if (is_null($value)) {
                $event->discussion->featured_from = null;
            } else if ($value === 'next') {
                $event->discussion->featured_from = $this->scheduler->getNextUnusedDate();
            } else {
                $event->discussion->featured_from = Carbon::parse($value);
            }

            $updated = true;
        }

        if (Arr::exists($attributes, 'featuredUntil')) {
            $event->actor->assertCan('feature', $event->discussion);

            $value = Arr::get($attributes, 'featuredUntil');

            if (is_null($value)) {
                $event->discussion->featured_until = null;
            } else {
                $event->discussion->featured_until = Carbon::parse($value);
            }

            $updated = true;
        }

        if ($updated) {
            $event->discussion->afterSave(function (Discussion $discussion) use ($event) {
                if (!$this->settings->get('featured-discussions.eventPost')) {
                    return;
                }

                $discussion->mergePost(FeaturedPost::reply(
                    $discussion->id,
                    $event->actor->id,
                    $discussion->featured_from,
                    $discussion->featured_until
                ));
            });
        }
    }
}
