#!/usr/bin/env python3
"""
Interactive Anatomy Learning Assistant
=======================================
Comprehensive anatomy education tool providing structured anatomical
knowledge organized by region and system, with high-yield clinical
correlations and self-assessment capabilities.

Clinical Purpose:
    Supports medical students and healthcare professionals in learning
    and reviewing human anatomy with emphasis on clinically relevant
    relationships, common surgical landmarks, and pathological
    correlations. Each structure is linked to its clinical significance.

References:
    - Drake RL, Vogl AW, Mitchell AWM. Gray's Anatomy for Students. 4th Ed. 2020.
    - Moore KL, Dalley AF, Agur AMR. Clinically Oriented Anatomy. 8th Ed. 2018.
    - Netter FH. Atlas of Human Anatomy. 7th Ed. 2019.

DISCLAIMER: This tool is for educational purposes only. Anatomical
knowledge should be confirmed through cadaveric study, imaging review,
and approved educational resources.
"""

import json
import random
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class AnatomyRegion(Enum):
    HEAD_NECK = "head_and_neck"
    THORAX = "thorax"
    ABDOMEN = "abdomen"
    PELVIS = "pelvis_and_perineum"
    UPPER_LIMB = "upper_limb"
    LOWER_LIMB = "lower_limb"
    BACK = "back_and_spinal_cord"
    NEUROANATOMY = "neuroanatomy"


class SystemCategory(Enum):
    MUSCULOSKELETAL = "musculoskeletal"
    CARDIOVASCULAR = "cardiovascular"
    RESPIRATORY = "respiratory"
    GASTROINTESTINAL = "gastrointestinal"
    GENITOURINARY = "genitourinary"
    NERVOUS = "nervous_system"
    ENDOCRINE = "endocrine"
    LYMPHATIC = "lymphatic_immune"
    INTEGUMENTARY = "integumentary"


@dataclass
class AnatomicalStructure:
    name: str
    region: AnatomyRegion
    system: SystemCategory
    description: str
    origin: str = ""
    insertion: str = ""
    innervation: str = ""
    blood_supply: str = ""
    action: str = ""
    clinical_correlations: list = field(default_factory=list)
    high_yield: bool = False
    related_structures: list = field(default_factory=list)


# High-yield anatomical structures with clinical correlations
ANATOMY_DATABASE = {
    "brachial_plexus": AnatomicalStructure(
        name="Brachial Plexus",
        region=AnatomyRegion.UPPER_LIMB,
        system=SystemCategory.NERVOUS,
        description="Network of nerves formed by ventral rami of C5-T1 spinal nerves. "
                    "Organized into roots, trunks, divisions, and cords.",
        innervation="C5, C6, C7, C8, T1 ventral rami",
        clinical_correlations=[
            "Erb-Duchenne palsy (C5-C6): upper trunk injury, 'waiter's tip' position",
            "Klumpke palsy (C8-T1): lower trunk injury, claw hand deformity",
            "Winged scapula: long thoracic nerve (C5-C7) injury, serratus anterior paralysis",
            "Wrist drop: radial nerve injury (posterior cord), Saturday night palsy",
            "Hand of benediction: median nerve injury, inability to flex digits 1-3",
            "Claw hand: ulnar nerve injury, loss of interossei and lumbricals 3-4",
            "Thoracic outlet syndrome: compression at scalene triangle or costoclavicular space",
        ],
        high_yield=True,
        related_structures=["musculocutaneous_nerve", "median_nerve", "ulnar_nerve",
                            "radial_nerve", "axillary_nerve"],
    ),
    "circle_of_willis": AnatomicalStructure(
        name="Circle of Willis",
        region=AnatomyRegion.NEUROANATOMY,
        system=SystemCategory.CARDIOVASCULAR,
        description="Anastomotic arterial ring at the base of the brain formed by the "
                    "internal carotid and vertebrobasilar systems. Provides collateral "
                    "circulation to the cerebral hemispheres.",
        blood_supply="Internal carotid arteries (anterior), vertebral/basilar arteries (posterior)",
        clinical_correlations=[
            "Berry (saccular) aneurysm: most common at AComm (30-35%), then PComm",
            "AComm aneurysm rupture: SAH, may compress optic chiasm (bitemporal hemianopia)",
            "PComm aneurysm: compresses CN III, ipsilateral pupil dilation (down and out eye)",
            "MCA stroke: contralateral face/arm weakness, Broca aphasia (if dominant hemisphere)",
            "ACA stroke: contralateral leg weakness, personality changes",
            "PCA stroke: contralateral homonymous hemianopia with macular sparing",
            "Complete circle present in only ~20-25% of population",
        ],
        high_yield=True,
        related_structures=["anterior_cerebral_artery", "middle_cerebral_artery",
                            "posterior_cerebral_artery", "basilar_artery"],
    ),
    "inguinal_canal": AnatomicalStructure(
        name="Inguinal Canal",
        region=AnatomyRegion.ABDOMEN,
        system=SystemCategory.MUSCULOSKELETAL,
        description="Oblique passage through the lower anterior abdominal wall, ~4 cm long. "
                    "Transmits the spermatic cord (males) or round ligament (females).",
        clinical_correlations=[
            "Indirect inguinal hernia: enters deep ring LATERAL to inferior epigastric vessels, "
            "traverses canal, may exit through superficial ring into scrotum",
            "Direct inguinal hernia: protrudes through Hesselbach triangle MEDIAL to "
            "inferior epigastric vessels, does NOT enter deep ring",
            "Hesselbach triangle: inferior epigastric vessels (lateral), rectus abdominis (medial), "
            "inguinal ligament (inferior)",
            "Femoral hernia: below and lateral to pubic tubercle, through femoral ring. "
            "More common in females. Higher risk of strangulation.",
            "Deep inguinal ring: in transversalis fascia, midpoint of inguinal ligament",
            "Superficial inguinal ring: in external oblique aponeurosis, above pubic tubercle",
        ],
        high_yield=True,
        related_structures=["inguinal_ligament", "inferior_epigastric_artery",
                            "spermatic_cord", "ilioinguinal_nerve"],
    ),
    "coronary_arteries": AnatomicalStructure(
        name="Coronary Arteries",
        region=AnatomyRegion.THORAX,
        system=SystemCategory.CARDIOVASCULAR,
        description="First branches of the ascending aorta, arising from the aortic sinuses "
                    "of Valsalva. Supply the myocardium with oxygenated blood.",
        blood_supply="Left main -> LAD + LCx. Right coronary artery (RCA).",
        clinical_correlations=[
            "LAD occlusion: anterior wall MI, septal involvement. Most common vessel in MI.",
            "LAD supplies anterior 2/3 of interventricular septum, anterior wall of LV",
            "RCA occlusion: inferior MI, may cause AV nodal block (RCA supplies AV node in 85%)",
            "LCx occlusion: lateral wall MI, posterior MI in left-dominant circulation",
            "Right dominant circulation (85%): PDA arises from RCA",
            "Left dominant (8%): PDA arises from LCx. Codominant (7%): dual supply.",
            "Widowmaker: proximal LAD occlusion, carries highest mortality",
            "Coronary sinus: main venous drainage, empties into right atrium",
        ],
        high_yield=True,
        related_structures=["left_anterior_descending", "left_circumflex",
                            "right_coronary_artery", "posterior_descending_artery"],
    ),
    "cranial_nerves": AnatomicalStructure(
        name="Cranial Nerves (I-XII)",
        region=AnatomyRegion.HEAD_NECK,
        system=SystemCategory.NERVOUS,
        description="Twelve pairs of nerves emerging directly from the brain. "
                    "CN I and II from cerebrum, CN III-XII from brainstem.",
        clinical_correlations=[
            "CN I (Olfactory): anosmia in frontal lobe tumors, cribriform plate fractures",
            "CN II (Optic): visual field defects map lesion location (chiasm, tract, radiation)",
            "CN III (Oculomotor): 'down and out' eye, ptosis, mydriasis. PComm aneurysm.",
            "CN IV (Trochlear): difficulty going downstairs, head tilt. Only CN crossing dorsally.",
            "CN V (Trigeminal): trigeminal neuralgia, corneal reflex (V1 afferent, VII efferent)",
            "CN VI (Abducens): medial strabismus, cannot abduct eye. Longest intracranial course.",
            "CN VII (Facial): Bell palsy (LMN=entire face), UMN=forehead spared. Taste ant 2/3.",
            "CN VIII (Vestibulocochlear): sensorineural vs conductive hearing loss (Weber/Rinne)",
            "CN IX (Glossopharyngeal): gag reflex afferent, taste post 1/3 tongue",
            "CN X (Vagus): recurrent laryngeal nerve palsy (hoarseness), left wraps aortic arch",
            "CN XI (Accessory): SCM and trapezius. Damaged in posterior triangle surgery.",
            "CN XII (Hypoglossal): tongue deviates toward side of lesion (LMN)",
        ],
        high_yield=True,
        related_structures=["brainstem", "skull_base_foramina"],
    ),
    "knee_joint": AnatomicalStructure(
        name="Knee Joint",
        region=AnatomyRegion.LOWER_LIMB,
        system=SystemCategory.MUSCULOSKELETAL,
        description="Largest and most complex synovial joint. Modified hinge joint between "
                    "femur, tibia, and patella. Stabilized by cruciate and collateral ligaments.",
        clinical_correlations=[
            "ACL tear: anterior drawer test positive, pivot shift test. Non-contact deceleration injury.",
            "PCL tear: posterior drawer test, dashboard injury (posterior force on tibia)",
            "MCL tear: valgus stress test, often with ACL tear (unhappy triad)",
            "Unhappy triad: ACL + MCL + medial meniscus (or lateral meniscus per recent evidence)",
            "Lateral meniscus tear: McMurray test with internal rotation",
            "Medial meniscus tear: McMurray test with external rotation. More common than lateral.",
            "Baker cyst: popliteal cyst, associated with meniscal tears or osteoarthritis",
            "Patellar tendon reflex: L3-L4, femoral nerve",
            "Popliteal artery: deepest structure in popliteal fossa, at risk in posterior dislocation",
        ],
        high_yield=True,
        related_structures=["anterior_cruciate_ligament", "posterior_cruciate_ligament",
                            "medial_collateral_ligament", "lateral_collateral_ligament",
                            "medial_meniscus", "lateral_meniscus"],
    ),
    "diaphragm": AnatomicalStructure(
        name="Diaphragm",
        region=AnatomyRegion.THORAX,
        system=SystemCategory.MUSCULOSKELETAL,
        description="Primary muscle of respiration. Dome-shaped musculotendinous sheet "
                    "separating thoracic and abdominal cavities.",
        innervation="Phrenic nerve (C3, C4, C5 - 'C3, 4, 5 keeps the diaphragm alive')",
        clinical_correlations=[
            "Hiatal hernia: sliding (Type I, 95%) or paraesophageal (Type II-IV)",
            "Aortic hiatus (T12): aorta, thoracic duct, azygos vein. Behind median arcuate ligament.",
            "Esophageal hiatus (T10): esophagus, vagus nerve (anterior and posterior trunks)",
            "Caval opening (T8): IVC, right phrenic nerve. In central tendon (no compression).",
            "Mnemonic: I (IVC) ate (8) ten (10) eggs (esophagus) at (aorta) twelve (12)",
            "Phrenic nerve injury: ipsilateral hemidiaphragm paralysis (elevated on CXR, sniff test)",
            "Referred pain from diaphragm irritation: shoulder tip pain (C3-5 dermatome, Kehr sign)",
            "Congenital diaphragmatic hernia (Bochdalek): left posterolateral, neonatal emergency",
        ],
        high_yield=True,
        related_structures=["phrenic_nerve", "esophageal_hiatus", "aortic_hiatus",
                            "caval_opening"],
    ),
}


@dataclass
class QuizQuestion:
    question: str
    options: dict
    correct_answer: str
    explanation: str
    structure: str
    difficulty: str = "medium"


def get_structure_info(structure_key: str) -> dict:
    """Get detailed information about an anatomical structure."""
    structure = ANATOMY_DATABASE.get(structure_key)
    if not structure:
        return {
            "error": f"Structure '{structure_key}' not found",
            "available_structures": list(ANATOMY_DATABASE.keys()),
        }

    return {
        "name": structure.name,
        "region": structure.region.value,
        "system": structure.system.value,
        "description": structure.description,
        "origin": structure.origin or None,
        "insertion": structure.insertion or None,
        "innervation": structure.innervation or None,
        "blood_supply": structure.blood_supply or None,
        "action": structure.action or None,
        "clinical_correlations": structure.clinical_correlations,
        "high_yield": structure.high_yield,
        "related_structures": structure.related_structures,
    }


def list_structures(region: str = None, system: str = None) -> dict:
    """List available anatomical structures, optionally filtered by region or system."""
    results = []
    for key, structure in ANATOMY_DATABASE.items():
        if region and structure.region.value != region:
            continue
        if system and structure.system.value != system:
            continue
        results.append({
            "key": key,
            "name": structure.name,
            "region": structure.region.value,
            "system": structure.system.value,
            "high_yield": structure.high_yield,
            "num_clinical_correlations": len(structure.clinical_correlations),
        })

    return {
        "count": len(results),
        "structures": results,
        "available_regions": [r.value for r in AnatomyRegion],
        "available_systems": [s.value for s in SystemCategory],
    }


def generate_quiz(region: str = None, num_questions: int = 5) -> dict:
    """
    Generate anatomy quiz questions with clinical correlations.

    Questions focus on clinically relevant anatomy rather than pure
    memorization, emphasizing the type of knowledge tested on board exams.
    """
    # Pre-built question bank based on high-yield clinical anatomy
    question_bank = [
        QuizQuestion(
            question="A patient presents with wrist drop after falling asleep with their arm "
                     "draped over a chair. Which nerve is most likely injured?",
            options={"A": "Median nerve", "B": "Ulnar nerve", "C": "Radial nerve",
                     "D": "Musculocutaneous nerve", "E": "Axillary nerve"},
            correct_answer="C",
            explanation="Radial nerve compression in the spiral groove of the humerus "
                        "(Saturday night palsy) causes wrist drop due to paralysis of wrist "
                        "and finger extensors. The radial nerve is the continuation of the "
                        "posterior cord of the brachial plexus.",
            structure="brachial_plexus",
        ),
        QuizQuestion(
            question="A 55-year-old woman presents with sudden severe headache and a fixed, "
                     "dilated pupil with the eye deviated 'down and out.' Which structure is "
                     "most likely compressed?",
            options={"A": "CN IV (Trochlear)", "B": "CN VI (Abducens)",
                     "C": "CN III (Oculomotor)", "D": "CN II (Optic)",
                     "E": "Sympathetic chain"},
            correct_answer="C",
            explanation="CN III compression (typically by a PComm aneurysm) causes ptosis, "
                        "mydriasis (dilated pupil), and 'down and out' eye position due to "
                        "unopposed lateral rectus (CN VI) and superior oblique (CN IV) action.",
            structure="circle_of_willis",
        ),
        QuizQuestion(
            question="A 45-year-old man presents with a bulge above the inguinal ligament that "
                     "extends into the scrotum. On examination, the hernia is lateral to the "
                     "inferior epigastric vessels. What type of hernia is this?",
            options={"A": "Direct inguinal hernia", "B": "Indirect inguinal hernia",
                     "C": "Femoral hernia", "D": "Umbilical hernia",
                     "E": "Spigelian hernia"},
            correct_answer="B",
            explanation="Indirect inguinal hernias enter the deep inguinal ring LATERAL to the "
                        "inferior epigastric vessels, traverse the inguinal canal, and may "
                        "descend into the scrotum. Direct hernias are MEDIAL to these vessels.",
            structure="inguinal_canal",
        ),
        QuizQuestion(
            question="A patient presents with an acute inferior STEMI. ECG shows ST elevation "
                     "in leads II, III, and aVF with new-onset second-degree AV block. "
                     "Which artery is most likely occluded?",
            options={"A": "Left anterior descending", "B": "Left circumflex",
                     "C": "Right coronary artery", "D": "Left main",
                     "E": "Diagonal branch"},
            correct_answer="C",
            explanation="The RCA supplies the inferior wall of the left ventricle and, in 85% "
                        "of patients (right-dominant circulation), the AV node. RCA occlusion "
                        "causes inferior MI (II, III, aVF) and may produce AV nodal conduction "
                        "disturbances.",
            structure="coronary_arteries",
        ),
        QuizQuestion(
            question="A patient presents with tongue deviation to the left on protrusion. "
                     "Which cranial nerve is affected and on which side?",
            options={"A": "Right CN XII", "B": "Left CN XII", "C": "Right CN X",
                     "D": "Left CN IX", "E": "Right CN VII"},
            correct_answer="B",
            explanation="The hypoglossal nerve (CN XII) innervates the genioglossus, which "
                        "protrudes the tongue to the contralateral side. In a lower motor neuron "
                        "lesion, the tongue deviates TOWARD the side of the lesion. Left "
                        "deviation indicates left CN XII palsy.",
            structure="cranial_nerves",
        ),
        QuizQuestion(
            question="A football player is tackled and sustains a valgus force to the knee. "
                     "MRI reveals tears of the ACL, MCL, and medial meniscus. What is this "
                     "injury pattern called?",
            options={"A": "Terrible triad", "B": "Unhappy triad",
                     "C": "Dashboard injury", "D": "Segond fracture",
                     "E": "O'Donoghue triad"},
            correct_answer="B",
            explanation="The unhappy (O'Donoghue) triad is a combined injury to the ACL, MCL, "
                        "and medial meniscus (classically), caused by a lateral blow to the "
                        "knee creating valgus stress. Recent evidence suggests the lateral "
                        "meniscus may be more commonly involved than previously thought.",
            structure="knee_joint",
        ),
        QuizQuestion(
            question="A newborn presents with respiratory distress. Chest X-ray shows bowel "
                     "loops in the left hemithorax. What is the most likely diagnosis?",
            options={"A": "Morgagni hernia", "B": "Sliding hiatal hernia",
                     "C": "Bochdalek hernia", "D": "Paraesophageal hernia",
                     "E": "Eventration of diaphragm"},
            correct_answer="C",
            explanation="Congenital diaphragmatic hernia (Bochdalek type) occurs through the "
                        "left posterolateral foramen due to failure of the pleuroperitoneal "
                        "membrane to close. It presents in neonates with respiratory distress "
                        "and bowel sounds in the chest. Left-sided in ~85% of cases.",
            structure="diaphragm",
        ),
    ]

    # Filter by region if specified
    if region:
        filtered = [q for q in question_bank
                    if ANATOMY_DATABASE.get(q.structure, AnatomicalStructure(
                        "", AnatomyRegion.HEAD_NECK, SystemCategory.MUSCULOSKELETAL, ""
                    )).region.value == region]
        if filtered:
            question_bank = filtered

    # Select questions
    selected = question_bank[:min(num_questions, len(question_bank))]

    return {
        "quiz": {
            "num_questions": len(selected),
            "region_filter": region,
            "questions": [
                {
                    "number": i + 1,
                    "question": q.question,
                    "options": q.options,
                    "correct_answer": q.correct_answer,
                    "explanation": q.explanation,
                    "related_structure": q.structure,
                }
                for i, q in enumerate(selected)
            ],
        },
        "disclaimer": "Educational content for study purposes only.",
    }


def run_anatomy_tutor(action: str, **kwargs) -> str:
    """
    Main entry point for the Anatomy Learning Assistant.

    Actions:
        lookup: Get detailed info about a structure (structure_key)
        list: List structures (region, system filters)
        quiz: Generate quiz questions (region, num_questions)
        clinical: Get clinical correlations for a structure
    """
    if action == "lookup":
        result = get_structure_info(kwargs.get("structure_key", ""))
    elif action == "list":
        result = list_structures(kwargs.get("region"), kwargs.get("system"))
    elif action == "quiz":
        result = generate_quiz(kwargs.get("region"), kwargs.get("num_questions", 5))
    elif action == "clinical":
        key = kwargs.get("structure_key", "")
        structure = ANATOMY_DATABASE.get(key)
        if structure:
            result = {
                "structure": structure.name,
                "clinical_correlations": structure.clinical_correlations,
            }
        else:
            result = {"error": f"Structure '{key}' not found"}
    else:
        result = {
            "error": f"Unknown action: {action}",
            "available_actions": ["lookup", "list", "quiz", "clinical"],
        }

    return json.dumps(result, indent=2)


if __name__ == "__main__":
    print("=== Circle of Willis ===")
    print(run_anatomy_tutor("lookup", structure_key="circle_of_willis"))
    print()
    print("=== Anatomy Quiz ===")
    print(run_anatomy_tutor("quiz", num_questions=3))
