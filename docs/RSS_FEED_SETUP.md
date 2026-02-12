# RSS Feed Setup for TinaCMS Blog

This project includes a complete RSS feed implementation that integrates with TinaCMS to automatically generate feeds from your blog posts.

## Features

- **RSS 2.0 Feed** (`/feed.xml`) - The standard RSS format, widely supported by feed readers
- **Atom Feed** (`/atom.xml`) - An alternative XML feed format
- **JSON Feed** (`/feed.json`) - A modern JSON-based feed format

## Implementation

### Feed Generation

The RSS feeds are generated using the `feed` npm package and are implemented as Next.js App Router route handlers:

- `app/feed.xml/route.ts` - RSS 2.0 feed
- `app/atom.xml/route.ts` - Atom feed
- `app/feed.json/route.ts` - JSON feed

### Configuration

Feed configuration is centralized in `lib/feed-config.ts` for easy maintenance.

### Environment Variables

You need to create a `.env.local` file for local development and set the following variables:

```env
# Required for TinaCMS (get these from app.tina.io)
NEXT_PUBLIC_TINA_CLIENT_ID=your-client-id
TINA_TOKEN=your-token
NEXT_PUBLIC_TINA_BRANCH=main

# Required for RSS feed generation (use your primary domain)
NEXT_PUBLIC_SITE_URL=https://harksingh.com

# Optional: Development port (defaults to 3001)
PORT=3001
```

**Note**: If not set, `NEXT_PUBLIC_SITE_URL` defaults to `https://harksingh.com`.

For production deployments, set these environment variables in your hosting platform (Vercel, Netlify, etc.).

#### Multiple Domains

If you have multiple domains pointing to your site (e.g., `harksingh.com`, `harksingh.com.au`, `talesofhark.com`), set `NEXT_PUBLIC_SITE_URL` to your primary domain. The feed URLs will use this domain for all links.

## How It Works

1. **Data Fetching**: Each feed route fetches all blog posts from TinaCMS using the GraphQL client
2. **Pagination**: The implementation handles pagination to fetch all posts, not just the first page
3. **Feed Generation**: Posts are added to the feed with metadata (title, date, excerpt, hero image, etc.)
4. **Caching**: Feeds are cached for 1 hour (`revalidate = 3600`) to optimize performance
5. **Auto-discovery**: RSS feed links are added to the HTML `<head>` in the root layout for automatic discovery by feed readers

## Testing Locally

1. Create a `.env.local` file with your TinaCMS credentials and site URL (see Environment Variables above)

2. Start the development server:
   ```bash
   pnpm dev
   ```
   The server will start on port 3001.

3. Visit the feed URLs:
   - RSS: http://localhost:3001/feed.xml
   - Atom: http://localhost:3001/atom.xml
   - JSON: http://localhost:3001/feed.json

4. Test with an RSS reader:
   - Copy the feed URL and paste it into any RSS reader application
   - Popular readers: Feedly, Inoreader, NetNewsWire, Reeder

## Customization

### Modify Feed Metadata

Edit `lib/feed-config.ts` to change:
- Site title and description
- Copyright information
- Author details
- Feed image and favicon

### Adjust Feed Items

Edit the route handlers to customize:
- Number of posts per feed (currently 100)
- Post excerpt formatting
- Image URL handling
- Additional metadata

### Change Cache Duration

Modify the `revalidate` value in each route handler:
```typescript
export const revalidate = 3600; // 1 hour in seconds
```

## TinaCMS Integration

The feeds automatically pull data from your TinaCMS collections using the generated GraphQL client. The implementation:

- Uses `client.queries.postConnection()` to fetch posts
- Sorts posts by date
- Handles pagination for large post collections
- Extracts metadata from TinaCMS fields (title, date, excerpt, heroImg, etc.)

## Troubleshooting

### Feed is Empty

- Ensure you have published posts in your TinaCMS content
- Check that posts have required fields (title, date)
- Verify the TinaCMS client is configured correctly

### Build Errors

- Make sure the `feed` package is installed: `pnpm add feed`
- Verify environment variables are set correctly
- Check that TinaCMS is properly configured and the GraphQL types are generated

### 404 on Feed URLs

- Ensure the feed route folders exist in the `app` directory
- Verify the `route.ts` files are present in each folder
- Check Next.js build output for any routing errors

## References

- [feed npm package](https://github.com/jpmonette/feed)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [RSS 2.0 Specification](https://www.rssboard.org/rss-specification)
- [Atom Specification](https://datatracker.ietf.org/doc/html/rfc4287)
- [JSON Feed Specification](https://www.jsonfeed.org/)
