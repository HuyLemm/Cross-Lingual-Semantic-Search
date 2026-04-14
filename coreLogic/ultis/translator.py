
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from functools import lru_cache
import re

VI_EN_MODEL = "VietAI/envit5-translation"
EN_VI_MODEL = "VietAI/envit5-translation" 

MAX_CHARS_PER_SEGMENT = 450
MAX_SEGMENTS = 6

_DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

def _split_text(text, max_chars=MAX_CHARS_PER_SEGMENT):
    """
    Chia text thành các đoạn nhỏ theo câu, không vượt quá max_chars
    """
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= max_chars:
        return [text]

    sentences = re.split(r"(?<=[.!?])\s+", text)
    segments = []
    buf = ""

    for sent in sentences:
        if len(buf) + len(sent) <= max_chars:
            buf += " " + sent
        else:
            if buf.strip():
                segments.append(buf.strip())
            buf = sent

        if len(segments) >= MAX_SEGMENTS:
            break

    if buf.strip() and len(segments) < MAX_SEGMENTS:
        segments.append(buf.strip())

    return segments


def _load_model(model_name):
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    model.to(_DEVICE)
    model.eval()
    return tokenizer, model


@lru_cache(maxsize=1)
def _vi_en_components():
    return _load_model(VI_EN_MODEL)


@lru_cache(maxsize=1)
def _en_vi_components():
    return _load_model(EN_VI_MODEL)


def _translate(text, tokenizer, model):
    segments = _split_text(text)
    outputs = []

    for seg in segments:
        inputs = tokenizer(
            seg,
            return_tensors="pt",
            truncation=True,
            max_length=512
        ).to(_DEVICE)

        with torch.no_grad():
            generated = model.generate(
                **inputs,
                max_length=512,
                num_beams=4
            )

        translated = tokenizer.decode(
            generated[0],
            skip_special_tokens=True
        )
        outputs.append(translated)

    return " ".join(outputs)


def translate_vi_to_en(text: str) -> str:
    """
    Dịch tiếng Việt → tiếng Anh
    """
    if not text or not text.strip():
        return text

    tokenizer, model = _vi_en_components()
    return _translate(text, tokenizer, model)


def translate_en_to_vi(text: str) -> str:
    """
    Dịch tiếng Anh → tiếng Việt
    """
    if not text or not text.strip():
        return text

    tokenizer, model = _en_vi_components()
    return _translate(text, tokenizer, model)
