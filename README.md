# Featured Discussions

![License](https://img.shields.io/badge/license-MIT-blue.svg) [![Latest Stable Version](https://img.shields.io/packagist/v/clarkwinkelmann/flarum-ext-featured-discussions.svg)](https://packagist.org/packages/clarkwinkelmann/flarum-ext-featured-discussions) [![Total Downloads](https://img.shields.io/packagist/dt/clarkwinkelmann/flarum-ext-featured-discussions.svg)](https://packagist.org/packages/clarkwinkelmann/flarum-ext-featured-discussions) [![Donate](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.me/clarkwinkelmann)

This extension adds a new filterable property to discussions.
At the moment it's not displayed in any special way inside Flarum, but it can be used via the REST API for special integrations.

Discussions can be queued with specific dates for start and end of featuring.
A schedule can be created from a CRON expression to easily manage the queue.

To retrieve discussions, use the `featured` filter.
By default discussions will be sorted by most recently featured, you can customize it using the `sort` parameter.

    GET https://flarum.tld/api/discussions?filter[featured]=1&sort=featuredFrom

The feature status has an expiration date, this prevents older entries from being retrieved via the API, and allows controlling how many entries will be visible at a given time.
The expiration duration can be customized per discussion, or with the global default duration in the settings.

## Installation

    composer require clarkwinkelmann/flarum-ext-featured-discussions:*

## Limitations

As you approach 50 scheduled discussions in the future, the "Next" option and the schedule page might stop working as expected.
Discussions can always be manually scheduled past that threshold.

Since the duration is constant but the schedule can be monthly, it's impossible to have the monthly featured status to expire exactly when the next feature starts.
This is probably not an issue when retrieving a given number of featured posts from the REST API since there can exist more featured posts than you actually display.

The moderation permission is tag scopable, but if you give different permissions in different tags the schedule page might present some confusing behavior since the user could see discussions they cannot reschedule.

## Support

This extension is under **minimal maintenance**.

It was developed for a client and released as open-source for the benefit of the community.
I might publish simple bugfixes or compatibility updates for free.

You can [contact me](https://clarkwinkelmann.com/flarum) to sponsor additional features or updates.

Support is offered on a "best effort" basis through the Flarum community thread.

## Links

- [GitHub](https://github.com/clarkwinkelmann/flarum-ext-featured-discussions)
- [Packagist](https://packagist.org/packages/clarkwinkelmann/flarum-ext-featured-discussions)
- [Discuss](https://discuss.flarum.org/d/28997)
