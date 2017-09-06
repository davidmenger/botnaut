{% raw %}<div id="Settings">&nbsp;</div>{% endraw %}

## Settings
**Kind**: global class  

* [Settings](#Settings)
    * [new Settings()](#new_Settings_new)
    * _instance_
        * [.greeting([text])](#Settings_greeting) ⇒ <code>this</code>
        * [.getStartedButton([payload])](#Settings_getStartedButton) ⇒ <code>this</code>
        * [.whitelistDomain(domains)](#Settings_whitelistDomain) ⇒ <code>this</code>
        * [.menu([locale], [inputDisabled])](#Settings_menu) ⇒ <code>MenuComposer</code>
    * _static_
        * [.Settings](#Settings_Settings)
            * [new Settings(token, [log])](#new_Settings_Settings_new)

{% raw %}<div id="new_Settings_new">&nbsp;</div>{% endraw %}

### new Settings()
Utility, which helps us to set up chatbot behavior

{% raw %}<div id="Settings_greeting">&nbsp;</div>{% endraw %}

### settings.greeting([text]) ⇒ <code>this</code>
Sets or clears bot's greeting

**Kind**: instance method of <code>[Settings](#Settings)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [text] | <code>string</code> | <code>false</code> | leave empty to clear |

{% raw %}<div id="Settings_getStartedButton">&nbsp;</div>{% endraw %}

### settings.getStartedButton([payload]) ⇒ <code>this</code>
Sets up the Get Started Button

**Kind**: instance method of <code>[Settings](#Settings)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [payload] | <code>string</code> &#124; <code>object</code> | <code>false</code> | leave blank to remove button, or provide the action |

**Example**  
```javascript
const settings = new Settings(config.facebook.pageToken);
settings.getStartedButton('/start'); // just an action
```
{% raw %}<div id="Settings_whitelistDomain">&nbsp;</div>{% endraw %}

### settings.whitelistDomain(domains) ⇒ <code>this</code>
Useful for using facebook extension in webviews

**Kind**: instance method of <code>[Settings](#Settings)</code>  

| Param | Type |
| --- | --- |
| domains | <code>string</code> &#124; <code>Array.&lt;string&gt;</code> | 

{% raw %}<div id="Settings_menu">&nbsp;</div>{% endraw %}

### settings.menu([locale], [inputDisabled]) ⇒ <code>MenuComposer</code>
Sets up the persistent menu

**Kind**: instance method of <code>[Settings](#Settings)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [locale] | <code>string</code> | <code>&quot;&#x27;default&#x27;&quot;</code> | 
| [inputDisabled] | <code>boolean</code> | <code>false</code> | 

**Example**  
```javascript
const { Settings } = require('botnaut');

const settings = new Settings('page-token-string');

settings
     .menu('fr_FR')
         .addNested('Nested Menu')
             .addUrl('Aller à google', 'https://google.com')
             .done()
         .addPostBack('Faire quelque chose', '/the/action')
     .menu() // the default menu
         .addNested('Nested Menu')
             .addUrl('Go to google', 'https://google.com')
             .done()
         .addPostBack('Do something', '/the/action')
     .done();
```
{% raw %}<div id="Settings_Settings">&nbsp;</div>{% endraw %}

### Settings.Settings
**Kind**: static class of <code>[Settings](#Settings)</code>  
{% raw %}<div id="new_Settings_Settings_new">&nbsp;</div>{% endraw %}

#### new Settings(token, [log])
Creates an instance of Settings.


| Param | Type |
| --- | --- |
| token | <code>string</code> | 
| [log] | <code>Object</code> | 

