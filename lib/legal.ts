import { supabase } from './supabase';
import i18n from './i18n';

export interface LegalDocument {
  id: string;
  type: string;
  title_en: string;
  title_he: string;
  content_en: string;
  content_he: string;
  created_at: string;
  updated_at: string;
}

export async function fetchLegalDocument(
  type: string
): Promise<{ title: string; content: string } | null> {
  try {
    const { data, error } = await supabase
      .from('legal_documents')
      .select('*')
      .eq('type', type)
      .maybeSingle();

    if (error) {
      console.error('Error fetching legal document:', error);
      return null;
    }

    if (!data) {
      console.error('Legal document not found:', type);
      return null;
    }

    const currentLanguage = i18n.language;
    const isHebrew = currentLanguage === 'he';

    return {
      title: isHebrew ? data.title_he : data.title_en,
      content: isHebrew ? data.content_he : data.content_en,
    };
  } catch (err) {
    console.error('Unexpected error fetching legal document:', err);
    return null;
  }
}
