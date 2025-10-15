-- =====================================================
-- Storage Bucket Configuration for Report PDFs
-- =====================================================

-- Create storage bucket for PDF reports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-pdfs',
  'report-pdfs',
  false,
  52428800, -- 50MB in bytes
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Storage RLS Policies
-- =====================================================

-- Policy: Users can upload PDFs for their own reports
CREATE POLICY "Users can upload PDFs for own reports"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'report-pdfs' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM reports r
      JOIN testing_sessions ts ON r.session_id = ts.id
      WHERE r.id::text = (storage.foldername(name))[1]
        AND ts.operator_id = auth.uid()
    )
  );

-- Policy: Users can view PDFs for reports they have access to
CREATE POLICY "Users can view PDFs for accessible reports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'report-pdfs' AND
    auth.uid() IS NOT NULL AND
    (
      -- User owns the session
      EXISTS (
        SELECT 1 FROM reports r
        JOIN testing_sessions ts ON r.session_id = ts.id
        WHERE r.id::text = (storage.foldername(name))[1]
          AND ts.operator_id = auth.uid()
      )
      OR
      -- User is engineer or admin
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('engineer', 'admin')
      )
    )
  );

-- Policy: Users can update PDFs for their own reports
CREATE POLICY "Users can update PDFs for own reports"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'report-pdfs' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM reports r
      JOIN testing_sessions ts ON r.session_id = ts.id
      WHERE r.id::text = (storage.foldername(name))[1]
        AND ts.operator_id = auth.uid()
    )
  );

-- Policy: Users can delete PDFs for their own reports
CREATE POLICY "Users can delete PDFs for own reports"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'report-pdfs' AND
    auth.uid() IS NOT NULL AND
    (
      EXISTS (
        SELECT 1 FROM reports r
        JOIN testing_sessions ts ON r.session_id = ts.id
        WHERE r.id::text = (storage.foldername(name))[1]
          AND ts.operator_id = auth.uid()
      )
      OR
      -- Admins can delete any PDF
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Policy: Engineers and admins can upload any PDF
CREATE POLICY "Engineers and admins can upload any PDF"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'report-pdfs' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

-- =====================================================
-- Storage Helper Functions
-- =====================================================

-- Function to generate storage path for report PDF
CREATE OR REPLACE FUNCTION get_report_pdf_path(report_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN report_id::text || '/report.pdf';
END;
$$ LANGUAGE plpgsql;

-- Function to get public URL for report PDF (with signed URL)
CREATE OR REPLACE FUNCTION get_report_pdf_url(report_id UUID, expires_in INTEGER DEFAULT 3600)
RETURNS TEXT AS $$
DECLARE
  file_path TEXT;
BEGIN
  file_path := get_report_pdf_path(report_id);
  -- Note: Actual signed URL generation happens in application code
  -- This function returns the path that will be used
  RETURN 'report-pdfs/' || file_path;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_report_pdf_path IS 'Generate storage path for report PDF file';
COMMENT ON FUNCTION get_report_pdf_url IS 'Get storage URL path for report PDF (signed URL generated in app)';
