
import { SlideData, TextElement } from '../types';

declare const JSZip: any;

const getTextFromNodes = (nodes: NodeListOf<Element>): string[] => {
  const texts: string[] = [];
  nodes.forEach(node => {
    if (node.textContent) {
      texts.push(node.textContent);
    }
  });
  return texts;
};

const replaceTextInNodes = (nodes: NodeListOf<Element>, translatedTexts: string[]) => {
  nodes.forEach((node, index) => {
    if (translatedTexts[index] !== undefined) {
      node.textContent = translatedTexts[index];
    }
  });
};

export const extractSlideData = async (file: File): Promise<SlideData[]> => {
  const zip = await JSZip.loadAsync(file);
  const slideData: SlideData[] = [];
  const slidePromises: Promise<void>[] = [];

  const parser = new DOMParser();

  zip.file(/ppt\/slides\/slide\d+\.xml/).forEach((slideFile: any) => {
    const slideNumber = parseInt(slideFile.name.match(/(\d+)\.xml$/)[1], 10);
    
    const slidePromise = (async () => {
        const slideXml = await slideFile.async('string');
        const slideDoc = parser.parseFromString(slideXml, 'application/xml');
        const slideTextNodes = slideDoc.querySelectorAll('a\\:t');
        const originalTexts = getTextFromNodes(slideTextNodes);

        // Find corresponding notes slide
        let originalNotes: string[] = [];
        const relsFile = zip.file(`ppt/slides/_rels/slide${slideNumber}.xml.rels`);
        if (relsFile) {
            const relsXml = await relsFile.async('string');
            const relsDoc = parser.parseFromString(relsXml, 'application/xml');
            const noteRel = relsDoc.querySelector('Relationship[Type*="notesSlide"]');
            if (noteRel) {
                const notePath = `ppt/notesSlides/${noteRel.getAttribute('Target').split('/').pop()}`;
                const notesFile = zip.file(notePath);
                if (notesFile) {
                    const notesXml = await notesFile.async('string');
                    const notesDoc = parser.parseFromString(notesXml, "application/xml");
                    const notesTextNodes = notesDoc.querySelectorAll('a\\:t');
                    originalNotes = getTextFromNodes(notesTextNodes);
                }
            }
        }

        if (originalTexts.length > 0 || originalNotes.length > 0) {
            slideData.push({
                slideNumber,
                texts: originalTexts.map(t => ({ original: t, translated: '' })),
                notes: originalNotes.map(t => ({ original: t, translated: '' })),
            });
        }
    })();
    slidePromises.push(slidePromise);
  });

  await Promise.all(slidePromises);

  return slideData.sort((a, b) => a.slideNumber - b.slideNumber);
};

export const reassemblePptx = async (originalFile: File, translatedSlides: SlideData[]): Promise<string> => {
  const zip = await JSZip.loadAsync(originalFile);
  const parser = new DOMParser();
  const serializer = new XMLSerializer();
  const reassemblyPromises: Promise<void>[] = [];

  for (const slide of translatedSlides) {
    const slidePath = `ppt/slides/slide${slide.slideNumber}.xml`;
    const slideFile = zip.file(slidePath);

    if (slideFile) {
      const reassembleSlidePromise = (async () => {
        const slideXml = await slideFile.async('string');
        const slideDoc = parser.parseFromString(slideXml, 'application/xml');
        const slideTextNodes = slideDoc.querySelectorAll('a\\:t');
        replaceTextInNodes(slideTextNodes, slide.texts.map(t => t.translated));
        const newSlideXml = serializer.serializeToString(slideDoc);
        zip.file(slidePath, newSlideXml);
      })();
      reassemblyPromises.push(reassembleSlidePromise);
    }

    if (slide.notes.length > 0) {
      const reassembleNotesPromise = (async () => {
        const relsFile = zip.file(`ppt/slides/_rels/slide${slide.slideNumber}.xml.rels`);
        if(relsFile) {
          const relsXml = await relsFile.async('string');
          const relsDoc = parser.parseFromString(relsXml, "application/xml");
          const noteRel = relsDoc.querySelector('Relationship[Type*="notesSlide"]');
          if (noteRel) {
            const notePath = `ppt/notesSlides/${noteRel.getAttribute('Target').split('/').pop()}`;
            const notesFile = zip.file(notePath);
            if (notesFile) {
              const notesXml = await notesFile.async('string');
              const notesDoc = parser.parseFromString(notesXml, "application/xml");
              const notesTextNodes = notesDoc.querySelectorAll('a\\:t');
              replaceTextInNodes(notesTextNodes, slide.notes.map(n => n.translated));
              const newNotesXml = serializer.serializeToString(notesDoc);
              zip.file(notePath, newNotesXml);
            }
          }
        }
      })();
      reassemblyPromises.push(reassembleNotesPromise);
    }
  }
  
  await Promise.all(reassemblyPromises);

  const blob = await zip.generateAsync({ type: 'blob' });
  return URL.createObjectURL(blob);
};
