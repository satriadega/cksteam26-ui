import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createOrganization } from "../api";
import { showModal, hideModal } from "../store/modalSlice";

const BuatOrganisasiPage: React.FC = () => {
  const [organizationName, setOrganizationName] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAddMember = () => {
    if (memberInput.trim() !== "" && !members.includes(memberInput.trim())) {
      setMembers([...members, memberInput.trim()]);
      setMemberInput("");
    }
  };

  const handleRemoveMember = (memberToRemove: string) => {
    setMembers(members.filter((member) => member !== memberToRemove));
  };

  const handleCreateOrganization = () => {
    if (organizationName.trim() === "") {
      dispatch(
        showModal({
          type: "error",
          message: "Nama organisasi tidak boleh kosong.",
        })
      );
      return;
    }

    createOrganization({ organizationName, members })
      .then(() => {
        dispatch(
          showModal({
            type: "success",
            message: "Organisasi berhasil dibuat!",
            onConfirm: () => {
              dispatch(hideModal());
              navigate("/dashboard");
            },
          })
        );
        setOrganizationName("");
        setMemberInput("");
        setMembers([]);
      })
      .catch((error) => {
        console.error("Error creating organization:", error);
        const errorMessage =
          error.response?.data?.message || "Gagal membuat organisasi.";
        dispatch(showModal({ type: "error", message: errorMessage }));
      });
  };

  return (
    <div className="container mt-8 mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Buat Organisasi Baru
      </h1>

      <div className="mb-4">
        <label
          htmlFor="organizationName"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          Nama Organisasi
        </label>
        <input
          type="text"
          id="organizationName"
          placeholder="Masukkan Nama Organisasi"
          className="w-full p-2 border rounded mb-4"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="memberEmail"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          Tambah Anggota (Email)
        </label>
        <div className="flex">
          <input
            type="email"
            id="memberEmail"
            placeholder="Masukkan email anggota"
            className="w-full p-2 border rounded-l"
            value={memberInput}
            onChange={(e) => setMemberInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddMember();
              }
            }}
          />
          <button
            onClick={handleAddMember}
            className="bg-blue-500 text-white px-4 py-2 rounded-r"
          >
            Tambah
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Anggota Organisasi :</h2>
        {members.length > 0 ? (
          <ul className="list-disc list-inside mb-4">
            {members.map((member, index) => (
              <li key={index} className="flex justify-between items-center">
                {member}
                <button
                  onClick={() => handleRemoveMember(member)}
                  className="bg-red-500 text-white p-2 border- rounded-md mt-2 ml-4"
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Belum ada anggota ditambahkan.</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleCreateOrganization}
          className="bg-green-500 text-white px-6 py-2 rounded"
        >
          Buat Organisasi
        </button>
      </div>
    </div>
  );
};

export default BuatOrganisasiPage;
