const rateLimit = require('../../lib/rateLimit');
const { parseTextParam } = require('../../lib/requestValidation');

const DEFAULT_VOICE = 'ja-JP-NanamiNeural';
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: '请求过于频繁，请稍后再试。'
});

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsedText = parseTextParam(req.query.text, {
    name: 'text',
    required: true,
    maxLength: 120,
  });
  if (parsedText.error) {
    return res.status(400).json({ error: parsedText.error });
  }
  const text = parsedText.value;

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

export default rateLimit.withRateLimit(handler, limiter);
