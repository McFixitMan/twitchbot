# Token Instructions
This should probably be automated to some extent in the future, but this is the awful process I'm using now...

Replace:
    - YOUR_CLIENT_ID with your client ID
    - YOUR_REDIRECT_URI with the redirect URI configured for your bot. For now I'm just using localhost and taking the returned code from the query param to do this manually, could potentially have a webhost in the future to handle this stuff but I don't care enough for now
    - Modify scopes in the 'scope' query param (see: https://dev.twitch.tv/docs/authentication#scopes) for your needs... Since this is all in my control I'm going to give it literally every scope I can find to mess around with things

1. Go to:

    https://id.twitch.tv/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=analytics:read:extensions+bits:read+channel:edit:commercial+channel:manage:broadcast+channel:manage:extensions+chanel:manage:polls+channel:manage:predictions+channel:manage:redemptions+channel:manage:schedule+channel:manage:videos+channel:read:editors+channel:read:goals+channel:read:hype_train+channel:read:polls+channel:read:predictions+channel:read:redemptions+channel:read:stream_key+channel:read:subscriptions+clips:edit+moderation:read+moderator:manage:banned_users+moderator:read:blocked_terms+moderator:manage:blocked_terms+moderator:manage:automod+moderator:read:automod_settings+moderator:manage:automod_settings+moderator:read:chat_settings+user:edit+user:edit:follows+user:manage:blocked_users+user:read:blocked_users+user:read:broadcast+user:read:email+user:read:follows+user:read:subscriptions+channel_subscriptions+channel_commercial+channel_editor+user_follows_edit+channel_read+user_read+user_blocks_read+user_blocks+edit+channel:moderate+chat:edit+chat:read+whispers:read+whispers:edit

2. Sign in with the account you want to get tokens for, click authorize.
I do this for both my main account and my bot account - some managers are using the broadcaster token for more access, while the ChatManager uses the bot token because it's modded and I always want to respond in chat with my bot.

3. You'll be redirected to the YOUR_REDIRECT_URI (localhost in my case) with a 'code' query param, copy it

4. In postman, perform a post request to the URI below. Replace 'YOUR_CLIENT_ID', 'YOUR_CLIENT_SECRET', 'YOUR_REDIRECT_URL' with your stuff, and 'YOUR_CODE' with the code copied from the previous step:
    https://id.twitch.tv/oauth2/token?client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&code=YOUR_CODE&grant_type=authorization_code&redirect_uri=YOUR_REDIRECT_URL

5. The response will have the accessToken and refreshToken needed to use the authProvider - copy these into wherever you're storing them (db in this case)