export interface User {
  _id: string;
  phone_number: string;
  role: string;
  company_name?: string;
  org_nr?: string;
  address?: string;
  zip_code?: string;
  company_email?: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface Upload {
  _id: string;
  user_id: string;
  image_url: string;
  uploaded_at: Date | string;
  status: string;
  session_number: number;
  email_status: 'pending' | 'sent' | 'failed';
  email_sent_at?: Date | string;
  email_error?: string;
  email_id?: string;
}

export interface UploadSession {
  sessionNumber: number;
  uploads: Upload[];
  uploadedAt: Date | string;
}

export interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
  fromCamera: boolean;
}
