# This update

## Wallpaper preview page (Magnific-style)
Clicking any wallpaper now opens a clean detail view: breadcrumb, a title row
with the site avatar + a prominent Download button (with a size dropdown), and
the image shown big and centered on a flat surface. Removed the old device-frame
mockups, colour palette strip, ambient glow, and view/like clutter.

## Deleted dead / useless code
Removed 27 files that were no longer used after the redesign:
- Homepage sections: hero-home, testimonials, share-vision, home-sections,
  collections-row, stats-band, top-contributors, your-daily, hero-search,
  device-switcher, category-rail, category-pills, search-filter, coming-soon,
  count-up, reveal, countdown, set-wallpaper-button
- Preview extras: device-preview, resolution-grid, palette-strip, ambient-tint,
  download-counter
- Admin: the "Homepage Hero" and "Testimonials" pages (+ their nav links)
- Orphaned server actions (setHero, create/deleteTestimonial) and queries
  (getFeatured, getWallpaperOfTheDay, getHeroSetting, getTestimonials,
  the unused getWallpapers, the Testimonial type)
- The "Feature on homepage" checkbox in the upload form (editor's-choice concept)

Everything still builds cleanly (33 routes) and the site is now leaner and simpler.
