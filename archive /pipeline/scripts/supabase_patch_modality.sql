-- Normalize modality codes to atlas.html expected values
update public.atlas_images set modality = 'MRI' where modality in ('MR','mr','Mr');
update public.atlas_images set modality = 'CT'  where modality in ('ct','Ct');

-- Verify
select modality, count(*) from public.atlas_images group by modality;
