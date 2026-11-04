// Single source of truth for the site (synced with the Notion CV).

window.PROJECTS = [
  { year: 2025, when: "2025.06 – 2026.03", org: "Kumho Tire", title: "Generative AI-based pattern performance prediction & optimization system", tags: ["Generative", "Prediction"] },
  { year: 2025, when: "2025.07 – 2026.02", org: "Hyundai Mobis", title: "AI-driven optimal design of a dual-channel electric air vent",
    desc: "Conditional generative model and performance predictor for air-vent geometry, packaged as a design-optimization tool.", tags: ["Generative", "Optimization"] },
  { year: 2025, when: "2025.09 – 2026.03", org: "Korea Institute of Patent Strategy", pm: true, title: "IP-R&D strategy for AI-based generative design & performance prediction",
    desc: "Prior-art landscape of generative-design and prediction patents; IP-R&D strategy for Narnia Labs.", tags: ["IP"] },
  { year: 2025, when: "2025.02 – 2025.07", org: "BMW", pm: true, title: "AI model PoC across four vehicle crash datasets",
    desc: "Mesh-based result segmentation, video-based contact detection with time-frame segmentation, and crash-signal time-series prediction, delivered as low-code software.", tags: ["Prediction", "Crash"] },
  { year: 2024, when: "2024.12 – 2025.04", org: "Hyundai Mobis", title: "Lamp thermal-resistance prediction from 3D simulation data",
    desc: "3D deep-learning surrogate that replaces lamp thermal analysis directly from CAD geometry.", tags: ["Prediction", "3D"] },
  { year: 2024, when: "2024.07 – 2025.02", org: "Donghee Industrial", pm: true, title: "Generative design of battery-pack-case-to-body joint cross-sections",
    desc: "Cross-section generator, 1D time-series and 3D field predictors, Monte-Carlo optimization and automatic CAD extrusion. KSME Best Paper Award.", tags: ["Generative", "Prediction"] },
  { year: 2024, when: "2024.05 – 2024.08", org: "Volkswagen", title: "Car hood design generation & evaluation on CarHoods10k",
    desc: "Diffusion-based depth-map generator paired with a CNN evaluator for stress, displacement and mass.", tags: ["Generative", "Diffusion"] },
  { year: 2024, when: "2024.02 – 2024.08", org: "Hyundai Motor Company", pm: true, title: "Predicting and improving EV interior space value with AI",
    desc: "Preference models for interior technologies across driving scenarios, with sensitivity analysis software.", tags: ["Preference"] },
  { year: 2024, when: "2024.01 – 2024.06", org: "Hyundai Motor Company", pm: true, title: "Generative design of high-stiffness rib patterns for cast parts",
    desc: "Topology-optimization data generation, rib generator and stiffness predictor, Pareto-based recommendation and 2D→3D CAD.", tags: ["Generative", "Topology"] },
  { year: 2022, when: "2022.07 – 2023.06", org: "Hyundai Motor Company", title: "GNN-based performance prediction from 3D shape data", tags: ["Prediction", "GNN"] },
  { year: 2022, when: "2022.06 – 2023.01", org: "NIA", title: "AI training dataset construction: 3D asset–image pairs", tags: ["Data"] },
  { year: 2021, when: "2021.07 – 2022.06", org: "Hyundai Motor Company", pm: true, title: "Design-generation guidelines and AI classification for road wheels", tags: ["Generative"] },
  { year: 2021, when: "2021.06 – 2022.05", org: "Hyundai Motor Company", title: "Learning-based A/C plant & control models for integrated thermal management", tags: ["Physics-guided"] },
  { year: 2020, when: "2020.04 – 2021.03", org: "Hyundai Motor Company", title: "AI-based generative design framework for wheels considering stiffness and aesthetics", tags: ["Generative", "Aesthetics"] },
];

// type: journal | kjournal | intconf | kconf | thesis ; selected → shown on home page
window.PUBLICATIONS = [
  { type: "journal", year: 2026, selected: true, authors: "<me>Shin, D.</me>, Lee, S., Kang, N.*", fig: { src: "assets/img/pubs/2026-jcde-preference.jpg", caption: "Overall research framework" }, link: "https://arxiv.org/abs/2405.07193", title: "Learning Design Preferences through Design Feature Extraction and Weighted Ensemble", venue: "Journal of Computational Design and Engineering", detail: "13(4), 157–178" },
  { type: "journal", year: 2025, selected: true, authors: "Hong, S., Kwon, Y., <me>Shin, D.</me>, Park, J., Kang, N.*", fig: { src: "assets/img/pubs/2025-jmd-deepjeb.jpg", caption: "Graphical abstract" }, link: "https://drive.google.com/file/d/1v6MHD3gp6XJjAIYxmDUUS5mgqCPIjwck/view", title: "DeepJEB: 3D Deep Learning-based Synthetic Jet Engine Bracket Dataset", venue: "Journal of Mechanical Design", detail: "147(4), 041703" },
  { type: "journal", year: 2023, selected: true, authors: "Shin, S.†, <me>Shin, D.</me>†, Kang, N.*", fig: { src: "assets/img/pubs/2023-jcde-mlto-review.jpg", caption: "Visualization of the methodology by MLTO purpose" }, link: "https://doi.org/10.1093/jcde/qwad072", title: "Topology Optimization via Machine Learning and Deep Learning: A Review", venue: "Journal of Computational Design and Engineering", detail: "10(4), 1736–1766", badges: ["† Equal contribution"] },
  { type: "journal", year: 2023, fig: { src: "assets/img/pubs/2023-arxiv-inverse-design.jpg", caption: "Research framework" }, link: "https://arxiv.org/abs/2308.13000", authors: "Jwa, M., Kim, J., Shin, S., Jin, A., <me>Shin, D.</me>, Kang, N.*", title: "Performance Comparison of Design Optimization and Deep Learning-based Inverse Design", venue: "arXiv preprint", detail: "arXiv:2308.13000" },
  { type: "kjournal", year: 2022, authors: "<me>Shin, D.</me>, Kwon, Y., Kang, N.*", title: "인공지능 기반 모빌리티 설계: Deep Generative Design", venue: "정보과학회지", detail: "40(6), 25–34" },
  { type: "intconf", year: 2021, authors: "<me>Shin, D.</me>, Yoo, S., Lee, S., Kim, M., Hwang, K.H., Park, J.H., Kang, N.*", title: "How to Trade off Aesthetics and Performance in Generative Design?", venue: "ASEM21 World Congress" },
  { type: "intconf", year: 2021, authors: "Shin, S., <me>Shin, D.</me>, Kim, M., Ryu, H., Kang, N.*", title: "Machine Learning-based Topology Optimization: A Review", venue: "ASEM21 World Congress" },
  { type: "kconf", year: 2025, selected: true, authors: "<me>Shin, D.</me>, Seo, M., Kim, K., Cho, I., Lim, B., Park, S., Cho, D., Kim, J., Kang, N.*", title: "Generative Design for the Cross-Section of Vehicle Battery Pack Case-to-Body Connection", venue: "KSME CAE & Applied Mechanics Spring Conference", award: "Best Paper Award" },
  { type: "kconf", year: 2024, authors: "Kwon, Y., Hong, S., <me>Shin, D.</me>, Park, J., Kang, N.*", title: "DeepJEB: 3D 합성 제트 엔진 브라켓 데이터셋", venue: "KSME Annual Conference" },
  { type: "kconf", year: 2024, authors: "<me>Shin, D.</me>, Park, J., Seo, M., Kang, N.*", title: "암시적 신경 표현을 활용한 3D 필드 예측과 불확실성 정량화", venue: "KSME CAE & Applied Mechanics Spring Conference" },
  { type: "kconf", year: 2023, authors: "<me>Shin, D.</me>, Hong, S., Kang, N.*", title: "심미성 향상을 위한 강화학습 기반의 제너레이티브 디자인", venue: "KSME Annual Conference" },
  { type: "kconf", year: 2023, authors: "Yoo, S., Kwon, Y., Kim, E., <me>Shin, D.</me>, Ryu, H., Lee, S., Lim, B., Jang, J., Cho, I., Hong, S., Kang, N.*", title: "3D 딥러닝 기반의 제너레이티브 디자인: 잠재공간에서 수행하는 생성, 탐색, 예측 및 최적화", venue: "KSME CAE & Applied Mechanics Spring Conference" },
  { type: "kconf", year: 2023, authors: "Lee, S., Kim, J., Kim, S., Jin, A., Shin, S., <me>Shin, D.</me>, Kwon, Y., Kang, N.*", title: "제너레이티브 디자인을 통한 3D 데이터 생성", venue: "Korean Society for CDE Conference" },
  { type: "kconf", year: 2022, authors: "Yoo, S., <me>Shin, D.</me>, Park, U., Yang, U., Kang, N.*", title: "전기자동차의 통합열관리 시스템을 위한 물리 기반 인공신경망", venue: "KSAE Fall Conference" },
  { type: "kconf", year: 2022, authors: "<me>Shin, D.</me>, Lee, S., Kang, N.*", title: "디자인 특징 추출을 통한 딥러닝 기반 디자인 선호도 예측", venue: "KSME Annual Conference" },
  { type: "kconf", year: 2022, authors: "Park, J., <me>Shin, D.</me>, Yoo, S., Kang, N.*", title: "그래프 신경망을 이용한 3D 휠 성능 예측 기초 연구", venue: "KSME CAE & Applied Mechanics Spring Conference (poster)", award: "Student Competition Silver Prize" },
  { type: "kconf", year: 2022, authors: "Jwa, M., Shin, S., <me>Shin, D.</me>, Jin, A., Kang, N.*", title: "딥러닝 기반 역설계 기법의 성능 분석", venue: "KSME CAE & Applied Mechanics Spring Conference" },
  { type: "kconf", year: 2021, authors: "Jwa, M., Jin, A., <me>Shin, D.</me>, Shin, S., Kang, N.*", title: "딥러닝 기반 역설계와 최적 설계의 비교", venue: "KSME CAE & Applied Mechanics Spring Conference (poster)", award: "Best Poster Award" },
  { type: "kconf", year: 2020, authors: "<me>Shin, D.</me>, Shin, S., Kang, N.*", title: "서스펜션의 제너레이티브 디자인에 대한 기초 연구", venue: "KSME Annual Conference (poster)" },
  { type: "thesis", year: 2023, authors: "<me>Shin, D.</me>", title: "Learning Design Preferences through Design Feature Extraction and Weighted Ensemble", venue: "M.S. Thesis, Cho Chun Shik Graduate School of Mobility, KAIST" },
];

window.PUB_GROUPS = [
  ["journal", "International Journals"],
  ["kjournal", "Korean Journals"],
  ["intconf", "International Conferences"],
  ["kconf", "Korean Conferences"],
  ["thesis", "Thesis"],
];

