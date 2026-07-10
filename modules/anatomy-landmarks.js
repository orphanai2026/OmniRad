/* OmniRad — Anatomical position landmarks (Terminologia Anatomica / RadLex-based).
   Injected into prompts to improve realistic organ positioning.
   ⚕️ NEEDS RADIOLOGIST REVIEW before final clinical/educational adoption.
   Keyed by organ value (matching organ dropdown). [English landmark phrase, Arabic]. */
window.ANATOMY_LANDMARKS = {
  "Right kidney":["right kidney positioned lower than the left, spanning approximately T12–L3, retroperitoneal, just below the liver","الكلية اليمنى أخفض من اليسرى، تمتد تقريباً T12–L3، خلف الصفاق أسفل الكبد"],
  "Left kidney":["left kidney positioned higher than the right, spanning approximately T11–L2, retroperitoneal","الكلية اليسرى أعلى من اليمنى، تمتد تقريباً T11–L2، خلف الصفاق"],
  "Kidneys":["right kidney lower than the left (displaced by the liver), retroperitoneal, spanning T11–L3","الكلية اليمنى أخفض من اليسرى (بسبب الكبد)، خلف الصفاق، تمتد T11–L3"],
  "Liver":["liver in the right upper quadrant beneath the right hemidiaphragm, largest lobe on the right","الكبد في الربع العلوي الأيمن تحت الحجاب الحاجز الأيمن"],
  "Spleen":["spleen in the left upper quadrant behind the stomach, along ribs 9–11","الطحال في الربع العلوي الأيسر خلف المعدة، بمحاذاة الأضلاع 9–11"],
  "Pancreas":["pancreas retroperitoneal at the L1–L2 level, head within the duodenal loop, tail toward the splenic hilum","البنكرياس خلف الصفاق عند مستوى L1–L2، الرأس داخل عروة الاثني عشر والذيل نحو سرة الطحال"],
  "Gallbladder & biliary tree":["gallbladder on the inferior surface of the right hepatic lobe","المرارة على السطح السفلي للفص الكبدي الأيمن"],
  "Adrenal glands":["adrenal glands superomedial to each kidney, retroperitoneal","الغدد الكظرية أعلى وإنسي كل كلية، خلف الصفاق"],
  "Stomach":["stomach in the left upper quadrant between the esophagus and duodenum","المعدة في الربع العلوي الأيسر بين المريء والاثني عشر"],
  "Abdominal aorta":["abdominal aorta anterior to the vertebral bodies, slightly left of midline, bifurcating at L4","الأبهر البطني أمام أجسام الفقرات، يسار خط الوسط قليلاً، يتفرع عند L4"],
  "Inferior vena cava":["inferior vena cava to the right of the abdominal aorta, anterolateral to the spine","الوريد الأجوف السفلي يمين الأبهر البطني، أمامي جانبي للعمود"],
  "Heart":["heart in the middle mediastinum, two-thirds left of midline, apex pointing inferolaterally to the left","القلب في المنصف الأوسط، ثلثاه يسار خط الوسط، القمة نحو الأسفل واليسار"],
  "Thoracic aorta":["thoracic aorta arching over the left main bronchus, descending left of the vertebral column","الأبهر الصدري يقوس فوق القصبة اليسرى وينزل يسار العمود الفقري"],
  "Appendix":["appendix arising from the cecum in the right iliac fossa","الزائدة الدودية من الأعور في الحفرة الحرقفية اليمنى"],
  "Urinary bladder":["urinary bladder in the anterior pelvis behind the pubic symphysis","المثانة في الحوض الأمامي خلف الارتفاق العاني"],
  "Prostate":["prostate inferior to the bladder, surrounding the proximal urethra","البروستاتا أسفل المثانة تحيط بالإحليل القريب"],
  "Uterus":["uterus in the midline pelvis between the bladder and rectum","الرحم في وسط الحوض بين المثانة والمستقيم"],
  "Thyroid gland":["thyroid gland anterior to the trachea at the C5–T1 level, two lobes joined by an isthmus","الغدة الدرقية أمام الرغامى عند C5–T1، فصان يصلهما برزخ"],
  "Lungs":["lungs flanking the mediastinum; right lung three lobes, left lung two lobes with a cardiac notch","الرئتان حول المنصف؛ اليمنى ثلاثة فصوص واليسرى فصان مع ثلمة قلبية"],
  "Brain":["brain within the cranial vault; supratentorial hemispheres above the tentorium, symmetric midline","الدماغ داخل القبو القحفي؛ نصفا الكرة فوق الخيمة، خط وسط متناظر"],
  "Cerebellum":["cerebellum in the posterior fossa below the tentorium, posterior to the brainstem and fourth ventricle","المخيخ في الحفرة الخلفية تحت الخيمة، خلف جذع الدماغ والبطين الرابع"]
};
