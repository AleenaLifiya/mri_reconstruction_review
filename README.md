# Putting the Slices Together

Companion resource for the review *Putting the Slices Together: A Review on Image-Domain MRI Reconstruction and Super-Resolution* (manuscript under review).

**Website:** https://aleenalifiya.github.io/mri_reconstruction_review/

The site gives a short summary of the review and a searchable matrix of the 181 included studies. Each study can be filtered by reconstruction setting, source of the degraded input, anatomy, dataset, model family, supervision, year and code availability.

## Data

| File | Contents |
|---|---|
| [`data/research_matrix.csv`](data/research_matrix.csv) | One row per reviewed study |
| [`data/research_matrix.json`](data/research_matrix.json) | The same matrix in JSON |
| [`data/datasets.csv`](data/datasets.csv) | The 40 public datasets and the number of reviewed studies using each |

The code of the protocol-sensitivity analysis reported in the review is in the `protocol_sensitivity/` folder.

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
  title  = {Putting the Slices Together: A Review on Image-Domain
            {MRI} Reconstruction and Super-Resolution},
  author = {Jeffy, Aleena Lifiya and Alkhatib, Mohammed Q. and
            Tliba, Marouane and Chetouani, Aladine and Aburaed, Nour},
  year   = {2026},
  note   = {Manuscript under review}
}
```

## License

This repository is released under the [MIT License](LICENSE). The Latin Modern fonts in `assets/fonts/` are distributed under the [GUST Font License](assets/fonts/GUST-FONT-LICENSE.txt). Linked papers, code and datasets remain under the terms set by their own authors.
