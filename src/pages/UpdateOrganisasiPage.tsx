import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization, // Add deleteOrganization import
} from "../api";
import { showModal, hideModal } from "../store/modalSlice";

const UpdateOrganisasiPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<
    {
      userId: number;
      organizationOwner: boolean;
      organization: {
        id: number;
        organizationName: string;
        publicVisibility: boolean;
      };
    }[]
  >([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<
    number | null
  >(null);
  const [organizationName, setOrganizationName] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [initialMembers, setInitialMembers] = useState<string[]>([]); // To track original members
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchOrganizations = () => {
    getOrganizations()
      .then((response) => {
        setOrganizations(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching organizations:", error);
        dispatch(
          showModal({ type: "error", message: "Error fetching organizations." })
        );
      });
  };

  const fetchSelectedOrganizationDetails = (id: number) => {
    getOrganizationById(id)
      .then((response) => {
        const organizationData = response.data.data[0]?.organization;
        const membersData = response.data.data.map(
          (member: { email: string }) => member.email
        );

        if (organizationData) {
          setOrganizationName(organizationData.organizationName);
        }
        setMembers(membersData);
        setInitialMembers(membersData); // Set initial members
      })
      .catch((error) => {
        console.error(
          "Error fetching organization by ID:",
          error.response?.data?.message || error.message || error
        );
        const errorMessage =
          error.response?.data?.message || "Error fetching organization details.";
        dispatch(showModal({ type: "error", message: errorMessage }));
      });
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrganizationId) {
      fetchSelectedOrganizationDetails(selectedOrganizationId);
    } else {
      setOrganizationName("");
      setMembers([]);
      setInitialMembers([]); // Clear initial members
    }
  }, [selectedOrganizationId]);

  const handleAddMember = () => {
    if (memberInput.trim() !== "" && !members.includes(memberInput.trim())) {
      setMembers([...members, memberInput.trim()]);
      setMemberInput("");
    }
  };

  const handleRemoveMember = (memberToRemove: string) => {
    setMembers(members.filter((member) => member !== memberToRemove));
  };

  const handleUpdateOrganization = () => {
    if (selectedOrganizationId && organizationName.trim() !== "") {
      const addMember = members.filter(
        (member) => !initialMembers.includes(member)
      );
      const removeMember = initialMembers.filter(
        (member) => !members.includes(member)
      );

      updateOrganization(selectedOrganizationId, {
        organizationName,
        addMember,
        removeMember,
      })
        .then(() => {
          dispatch(
            showModal({
              type: "success",
              message: "Organisasi berhasil diperbarui!",
              onConfirm: () => {
                dispatch(hideModal());
                navigate("/dashboard");
              },
            })
          );
          fetchOrganizations();
          if (selectedOrganizationId) {
            fetchSelectedOrganizationDetails(selectedOrganizationId);
          }
        })
        .catch((error) => {
          console.error("Error updating organization:", error);
          const errorMessage =
            error.response?.data?.message || "Gagal memperbarui organisasi.";
          dispatch(showModal({ type: "error", message: errorMessage }));
          if (selectedOrganizationId) {
            fetchSelectedOrganizationDetails(selectedOrganizationId); // Re-fetch on error to revert UI
          }
        });
    } else {
      dispatch(
        showModal({
          type: "error",
          message: "Pilih organisasi dan masukkan nama organisasi.",
        })
      );
    }
  };

  const handleDeleteOrganization = () => {
    if (selectedOrganizationId) {
      dispatch(
        showModal({
          type: "confirm",
          message: "Apakah Anda yakin ingin menghapus organisasi ini?",
          onConfirm: () => {
            deleteOrganization(selectedOrganizationId)
              .then(() => {
                dispatch(
                  showModal({
                    type: "success",
                    message: "Organisasi berhasil dihapus!",
                    onConfirm: () => {
                      dispatch(hideModal());
                      navigate("/dashboard");
                    },
                  })
                );
                setSelectedOrganizationId(null);
                setOrganizationName("");
                setMembers([]);
                setInitialMembers([]);
                fetchOrganizations();
              })
              .catch((error) => {
                console.error("Error deleting organization:", error);
                const errorMessage =
                  error.response?.data?.message || "Gagal menghapus organisasi.";
                dispatch(showModal({ type: "error", message: errorMessage }));
              });
          },
          onCancel: () => {
            dispatch(hideModal());
          },
        })
      );
    } else {
      dispatch(
        showModal({
          type: "error",
          message: "Pilih organisasi untuk dihapus.",
        })
      );
    }
  };

  return (
    <div className="container mt-8 mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Update Organisasi</h1>

      <div className="mb-4">
        <label
          htmlFor="organization"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          Pilih Organisasi
        </label>
        <select
          id="organization"
          className="w-full p-2 border rounded mb-4"
          onChange={(e) =>
            setSelectedOrganizationId(
              e.target.value ? parseInt(e.target.value) : null
            )
          }
          value={selectedOrganizationId || ""}
        >
          <option value="">Pilih Organisasi</option>
          {organizations.map((org) => (
            <option key={org.organization.id} value={org.organization.id}>
              {org.organization.organizationName}
            </option>
          ))}
        </select>
      </div>

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
          disabled={!selectedOrganizationId}
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
            disabled={!selectedOrganizationId}
          />
          <button
            onClick={handleAddMember}
            className="bg-blue-500 text-white px-4 py-2 rounded-r disabled:opacity-50"
            disabled={!selectedOrganizationId || memberInput.trim() === ""}
          >
            Tambah
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Anggota Organisasi :</h2>
        {members.length > 0 ? (
          <ul className="list-disc list-inside mb-4">
            {members.map((member: string, index: number) => (
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
          <p>Tidak ada anggota.</p>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={handleDeleteOrganization}
          className="bg-red-500 text-white px-6 py-2 rounded disabled:opacity-50"
          disabled={!selectedOrganizationId}
        >
          Hapus Organisasi
        </button>
        <button
          onClick={handleUpdateOrganization}
          className="bg-green-500 text-white px-6 py-2 rounded disabled:opacity-50"
          disabled={!selectedOrganizationId || organizationName.trim() === ""}
        >
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
};

export default UpdateOrganisasiPage;
