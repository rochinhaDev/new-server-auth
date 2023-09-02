import express from "express";
import isAuth from "../middlewares/isAuth.js";
import JobModel from "../model/job.model.js";
import BusinessModel from "../model/business.model.js";
import UserModel from "../model/user.model.js";

const jobRouter = express.Router();

//criar um job
jobRouter.post("/create", isAuth, async (req, res) => {
  try {
    const form = req.body;
    const id_business = req.auth._id;

    const jobCreated = await JobModel.create({
      ...form,
      business: id_business,
    });

    //adicionar o id do job recem criado dentro da array offers do business
    await BusinessModel.findByIdAndUpdate(id_business, {
      $push: { offers: jobCreated._id },
    });

    return res.status(201).json(jobCreated);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

//get ONE JOB /job/:id_job
jobRouter.get("/:id_job", isAuth, async (req, res) => {
  try {
    const id_job = req.params.id_job;

    const job = await JobModel.findById(id_job)
      .populate({
        path: "business",
        select: "name email telefone description",
      })
      .populate({
        path: "candidates",
        select: "name email telefone curriculo",
      })
      .populate({
        path: "select_candidate",
        select: "name email telefone description",
      });

    return res.status(200).json(job);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

jobRouter.get("/:id_job/public", async (req, res) => {
  try {
    const id_job = req.params.id_job;

    const job = await JobModel.findById(id_job).populate({
      path: "business",
      select: "name email telefone description",
    });

    return res.status(200).json(job);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

//get ALL JOBS open
jobRouter.get("/all/open", isAuth, async (req, res) => {
  try {
    const jobsOpen = await JobModel.find({ status: "ABERTA" });

    return res.status(200).json(jobsOpen);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

jobRouter.get("/all/open/public", async (req, res) => {
  try {
    const jobsOpen = await JobModel.find({ status: "ABERTA" });

    return res.status(200).json(jobsOpen);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

//edit job /job/edit/id_job
jobRouter.put("/edit/:id_job", isAuth, async (req, res) => {
  try {
    const id_job = req.params.id_job;
    const form = req.body;

    const updatedJob = await JobModel.findByIdAndUpdate(
      id_job,
      { ...form },
      { new: true, runValidators: true }
    );

    return res.status(200).json(updatedJob);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

// /job/delete/id_job
jobRouter.delete("/delete/:id_job", isAuth, async (req, res) => {
  try {
    const id_job = req.params.id_job;

    const deletedJob = await JobModel.findByIdAndUpdate(
      id_job,
      { status: "CANCELADA" },
      { new: true, runValidators: true }
    );

    return res.status(200).json(deletedJob);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

//apply
jobRouter.post("/apply/:id_job", isAuth, async (req, res) => {
  try {
    const id_job = req.params.id_job;
    const id_user = req.auth._id;

    // adicionar o id do user a array candidates
    await JobModel.findByIdAndUpdate(id_job, {
      $push: { candidates: id_user },
    });

    // adicionar o job na array de history_jobs do usuário
    await UserModel.findByIdAndUpdate(id_user, {
      $push: { history_jobs: id_job },
    });

    return res
      .status(200)
      .json({ message: "Você se candidatou para essa vaga de emprego!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

//unapply
jobRouter.post("/unapply/:id_job", isAuth, async (req, res) => {
  try {
    const id_job = req.params.id_job;
    const id_user = req.auth._id;

    // adicionar o id do user a array candidates
    await JobModel.findByIdAndUpdate(id_job, {
      $pull: { candidates: id_user },
    });

    // adicionar o job na array de history_jobs do usuário
    await UserModel.findByIdAndUpdate(id_user, {
      $pull: { history_jobs: id_job },
    });

    return res
      .status(200)
      .json({ message: "Você se candidatou para essa vaga de emprego!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

jobRouter.post(
  "/approved-candidate/:id_job/:id_user",
  isAuth,
  async (req, res) => {
    try {
      const id_job = req.params.id_job;
      const id_user = req.params.id_user;

      await JobModel.findByIdAndUpdate(id_job, {
        select_candidate: id_user,
        status: "FECHADA",
      });

      return res
        .status(200)
        .json({ message: "Candidato aprovado, a vaga foi fechada." });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);

export default jobRouter;
