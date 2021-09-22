import app from 'flarum/admin/app';

app.initializers.add('clarkwinkelmann-featured-discussions', () => {
    app.extensionData
        .for('clarkwinkelmann-featured-discussions')
        .registerSetting({
            setting: 'featured-discussions.schedule',
            type: 'text',
            label: app.translator.trans('clarkwinkelmann-featured-discussions.admin.settings.schedule'),
            placeholder: '0 0 1 * *',
        })
        .registerSetting({
            setting: 'featured-discussions.duration',
            type: 'text',
            label: app.translator.trans('clarkwinkelmann-featured-discussions.admin.settings.duration'),
            placeholder: '2678400',
        })
        .registerSetting({
            setting: 'featured-discussions.eventPost',
            type: 'boolean',
            label: app.translator.trans('clarkwinkelmann-featured-discussions.admin.settings.eventPost'),
        })
        .registerPermission({
            icon: 'fas fa-user-circle',
            label: app.translator.trans('clarkwinkelmann-featured-discussions.admin.permissions.feature'),
            permission: 'discussion.feature',
        }, 'moderate');
});
