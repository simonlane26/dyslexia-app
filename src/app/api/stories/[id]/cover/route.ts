import 'server-only';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';
import { createSupabaseServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Cover generation can take up to 30s
export const maxDuration = 60;

function cleanEnv(v?: string | null) {
  return (v || '').trim().replace(/^"(.*)"$/, '$1');
}

const OPENAI_KEY = cleanEnv(process.env.OPENAI_API_KEY);

const THEME_PROMPTS: Record<string, string> = {
  animals:     'A friendly forest glade with a fox and rabbit sitting together, sunlight filtering through trees, cheerful storybook illustration for children, vibrant colours, no text',
  space:       'A colourful rocket ship soaring through space past a ringed planet and shooting stars, cheerful storybook illustration for children, vibrant colours, no text',
  magic:       'A magical glowing wand with a star tip surrounded by sparkles and a wizard hat covered in stars, storybook illustration for children, vibrant colours, no text',
  funny:       'A giant laughing yellow smiley face surrounded by confetti and stars, cheerful cartoon illustration for children, vibrant colours, no text',
  pirates:     'A cheerful pirate ship sailing on a sunny sea with a skull-and-crossbones flag, storybook illustration for children, vibrant colours, no text',
  dinosaurs:   'A friendly cartoon dinosaur standing in a lush prehistoric jungle with ferns and a volcano, storybook illustration for children, vibrant colours, no text',
  superheroes: 'A heroic child in a cape flying over a cartoon city skyline at night with a glowing lightning bolt symbol, storybook illustration for children, vibrant colours, no text',
  underwater:  'A colourful coral reef with friendly tropical fish, a starfish, and bubbles floating up, storybook illustration for children, vibrant colours, no text',
  dragons:     'A friendly green dragon with big eyes perched on a moonlit mountain breathing small rainbow flames, storybook illustration for children, vibrant colours, no text',
  robots:      'A cute friendly robot with glowing eyes and a chest full of colourful buttons standing in a futuristic lab, storybook illustration for children, vibrant colours, no text',
};

function buildCoverPrompt(theme: string, title: string, characterName: string): string {
  const themeBase = THEME_PROMPTS[theme.toLowerCase()];
  if (themeBase) return themeBase;

  // Custom theme — build from story details
  return `A charming children's storybook cover illustration for a story called "${title}" featuring a character named ${characterName}. The story is about ${theme}. Warm vibrant colours, cute cartoon style, no text, no words, no letters.`;
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: seriesId } = await params;
  const db = createSupabaseServerClient();

  // Verify ownership and get story details
  const { data: series } = await db
    .from('story_series')
    .select('id, title, theme, character_name, cover_url')
    .eq('id', seriesId)
    .eq('clerk_user_id', userId)
    .single();

  if (!series) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Return existing cover if already generated
  if (series.cover_url) {
    return NextResponse.json({ coverUrl: series.cover_url });
  }

  if (!OPENAI_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
  }

  try {
    const openai = new OpenAI({ apiKey: OPENAI_KEY });

    // Generate the cover image with DALL-E 3
    const prompt = buildCoverPrompt(series.theme, series.title, series.character_name);
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
      response_format: 'url',
    });

    const dalleUrl = imageResponse.data?.[0]?.url;
    if (!dalleUrl) throw new Error('No image URL returned');

    // Download the image
    const imageRes = await fetch(dalleUrl);
    if (!imageRes.ok) throw new Error('Failed to download generated image');
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

    // Resize to thumbnail (800×500) and convert to WebP using sharp
    const sharp = (await import('sharp')).default;
    const webpBuffer = await sharp(imageBuffer)
      .resize(800, 500, { fit: 'cover', position: 'centre' })
      .webp({ quality: 82 })
      .toBuffer();

    // Upload to Supabase Storage
    const fileName = `${seriesId}/cover.webp`;
    const { error: uploadError } = await db.storage
      .from('story-covers')
      .upload(fileName, webpBuffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    // Get public URL
    const { data: urlData } = db.storage
      .from('story-covers')
      .getPublicUrl(fileName);

    const coverUrl = urlData.publicUrl;

    // Persist to the story series
    await db
      .from('story_series')
      .update({ cover_url: coverUrl })
      .eq('id', seriesId);

    return NextResponse.json({ coverUrl });
  } catch (e: any) {
    console.error('cover generation error:', e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
