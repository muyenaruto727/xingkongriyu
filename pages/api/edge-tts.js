const DEFAULT_VOICE = 'ja-JP-NanamiNeural';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const text = String(req.query.text || '').trim();
  if (!text) {
    return res.status(400).json({ error: 'Missing text' });
  }

  if (text.length > 120) {
    return res.status(400).json({ error: 'Text too long' });
  }

  try {
    const { EdgeTTS, Constants } = await import('@andresaya/edge-tts');
    const tts = new EdgeTTS();
    await tts.synthesize(text, DEFAULT_VOICE, {
      outputFormat: Constants.OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
      rate: -10,
      pitch: '+0Hz',
      volume: 100,
    });
    const audioBuffer = tts.toBuffer();

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(audioBuffer);
  } catch (error) {
    console.error('Edge TTS failed:', error);
    return res.status(500).json({ error: 'Failed to synthesize audio' });
  }
}
