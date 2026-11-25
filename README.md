# Putting the Slices Together

Companion resource for the review *Putting the Slices Together: A Critical Review of AI for Image-Domain MRI Reconstruction and Super-Resolution* (manuscript under review).

**Website:** https://aleenalifiya.github.io/mri_reconstruction_review/

The site gives a short summary of the review and a searchable matrix of the 183 included studies. Each study can be filtered by reconstruction setting, source of the degraded input, anatomy, dataset, model family, supervision, year and code availability.

## Data

| File | Contents |
|---|---|
| [`data/research_matrix.csv`](data/research_matrix.csv) | One row per reviewed study |
| [`data/research_matrix.json`](data/research_matrix.json) | The same matrix in JSON |
| [`data/datasets.csv`](data/datasets.csv) | The 40 public datasets and the number of reviewed studies using each |
| [`data/screening_record.csv`](data/screening_record.csv) | One row per identified record (456): its source, the query it was logged with, the stage it reached, the decision and the reason for exclusion |

The code of the protocol-sensitivity analysis reported in the review is in the `protocol_sensitivity/` folder.

## Search and selection

The database searches were run in July 2026 in Google Scholar, IEEE Xplore, Springer Nature Link and the ACM Digital Library, limited to 2020 to 2026 and sorted by relevance. The first 20 result pages of each query and source were inspected, and a record was kept when its title indicated an image-domain MRI reconstruction or super-resolution method. Further records came from citation searching and from landmark works of the field. The queries are given in Section 2 of the review:

- **Q1** `("accelerated MRI reconstruction" OR "fast MRI reconstruction" OR "undersampled MRI reconstruction" OR "MRI super-resolution" OR "slice reconstruction MRI" OR "through-plane MRI super-resolution")`
- **Q2** `("sparse slices" OR "sparsely acquired slices" OR "sparsely sampled slices") "3D MRI" reconstruction deep learning`
- **Q3** `("sparse slices" OR "through-plane super-resolution" OR "slice interpolation") MRI "3D reconstruction" "deep learning"`
- **Q4** `"anisotropic slice to volume reconstruction"`, `"thick to thin slice reconstruction"`, `"slice to volume reconstruction"` and `"inter-slice reconstruction"`, each searched as a separate phrase

`data/screening_record.csv` reproduces the counts of the flow diagram (456 records, 52 duplicates, 146 excluded at title and abstract, 75 excluded at full text, 183 included). Its decisions and reasons use the categories of the diagram.

## Matrix columns

| Column | Meaning |
|---|---|
| Review ID | Identifier of the study in the review's screening records |
| Study, Title, Year, Venue, Publication type | Bibliographic details |
| Anatomy | Organs studied |
| Reconstruction settings | Sparse-to-dense, thick-to-thin, slice-to-volume, in-plane super-resolution, accelerated acquisition or isotropic 3D. A study can have several |
| Through-plane | Whether the study addresses a through-plane setting |
| Degraded input | Simulated, real, both, or not stated |
| Degradation operator, Factors, Reference, Input | How the input was degraded, the factors evaluated, what the output is compared with, and what the model receives |
| Supervision | Paired, self-supervised, unpaired or unsupervised, subject-specific, or not stated |
| Datasets | Public datasets used |
| Model families | Family assigned in the review's grouped lists. Empty when the study is not grouped there |
| Code released, Code URL | Code availability as recorded in the review, and the repository named by the paper |
| DOI, Paper URL | Links to the publication |

## Citation

```bibtex
@unpublished{jeffy2026slices,
  title  = {Putting the Slices Together: A Critical Review of {AI} for
            Image-Domain {MRI} Reconstruction and Super-Resolution},
  author = {Jeffy, Aleena Lifiya and Alkhatib, Mohammed Q. and
            Tliba, Marouane and Chetouani, Aladine and Aburaed, Nour},
  year   = {2026},
  note   = {Manuscript under review}
}
```

## License

This repository is released under the [MIT License](LICENSE). The Latin Modern fonts in `assets/fonts/` are distributed under the [GUST Font License](assets/fonts/GUST-FONT-LICENSE.txt). Linked papers, code and datasets remain under the terms set by their own authors.
