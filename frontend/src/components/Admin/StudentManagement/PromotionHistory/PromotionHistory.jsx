import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "../../../../hooks/useLocalization";
import {
  ArrowTrendingUpIcon,
  AcademicCapIcon,
  ClockIcon,
  StarIcon,
  ArrowPathIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import StatCard from "../../../common/StatCard/StatCard";
import SelectInput from "../../../common/SelectInput/SelectInput";
import SearchInput from "../../../common/SearchInput/SearchInput";
import Table from "../../../common/Table/Table";
import Pagination from "../../../common/Pagination/Pagination";
import Button from "../../../common/Button/Button";
import ConfirmationModal from "../../../common/ConfirmationModal/ConfirmationModal";
import { getImageUrl } from "../../../../utils/imageUrl";
import studentService from "../../../../services/student/student.service";
import { CLASS_NAMES } from "../../../../utils/classNames";
import Spinner from "../../../common/Spinner/Spinner";

const ITEMS_PER_PAGE = 10;

const PromotionHistory = () => {
  const { t } = useTranslation();
  const [yearFilter, setYearFilter] = useState(t("all"));
  const [classFilter, setClassFilter] = useState(t("allClasses"));
  const [nameSearch, setNameSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [promotions, setPromotions] = useState([]);
  const [pagination, setPagination] = useState({ totalRecords: 0, totalPages: 0, currentPage: 1, limit: ITEMS_PER_PAGE });
  const [cards, setCards] = useState({ total: 0, thisYear: 0, thisMonth: 0, latest: 'N/A' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [reverseId, setReverseId] = useState(null);
  const [reversing, setReversing] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: currentPage, limit: ITEMS_PER_PAGE };
      if (yearFilter !== t("all")) params.toAcademicYear = yearFilter;
      if (classFilter !== t("allClasses")) params.toClass = classFilter;

      const data = await studentService.getStudentPromotions(params);
      if (data.success) {
        const mapped = (data.data?.promotions || []).map((h) => ({
          id: h._id,
          studentName: h.studentName || "Unknown",
          studentImage: h.studentImage || null,
          studentIdLabel: h.studentCode || "—",
          prevClass: h.fromClass,
          newClass: h.toClass,
          prevYear: h.fromAcademicYear || "—",
          newYear: h.toAcademicYear || "—",
          date: h.promotedAt
            ? new Date(h.promotedAt).toLocaleDateString()
            : "—",
          promotedBy: h.promotedBy?.fullName || h.promotedByName || "Admin",
          status: h.reversed
            ? "Reversed"
            : h.status === "Promoted"
              ? "Completed"
              : h.status || "—",
          reversed: !!h.reversed,
          promotedAt: h.promotedAt,
        }));
        setPromotions(mapped);
        if (data.data?.pagination) {
          setPagination(data.data.pagination);
        }
        if (data.data?.cards) {
          setCards(data.data.cards);
        }
      } else {
        setError(data.message || t("failedToLoad"));
        setPromotions([]);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || t("failedToLoad"),
      );
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, [t, currentPage, yearFilter, classFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
  }, [fetchHistory]);

  const handleDeleteClick = useCallback((id) => {
    setDeleteId(id);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await studentService.deleteStudentPromotion(deleteId);
      if (res.success) {
        toast.success(t("deletedSuccessfully"));
        setDeleteId(null);
        fetchHistory();
      } else {
        toast.error(res.message || t("failedToDelete"));
        setDeleteId(null);
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || t("failedToDelete"),
      );
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  }, [deleteId, fetchHistory, t]);

  const handleReverseClick = useCallback((id) => {
    setReverseId(id);
  }, []);

  const handleReverseConfirm = useCallback(async () => {
    if (!reverseId) return;
    setReversing(true);
    try {
      const res = await studentService.reverseStudentPromotion(reverseId);
      if (res.success) {
        toast.success(t("promotionReversedSuccessfully"));
        setReverseId(null);
        fetchHistory();
      } else {
        toast.error(res.message || t("reversePromotionFailed"));
        setReverseId(null);
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          t("reversePromotionFailed"),
      );
      setReverseId(null);
    } finally {
      setReversing(false);
    }
  }, [reverseId, fetchHistory, t]);

  const resetFilters = useCallback(() => {
    setYearFilter(t("all"));
    setClassFilter(t("allClasses"));
    setNameSearch("");
    setCurrentPage(1);
  }, [t]);

  const yearOptions = useMemo(() => {
    return [t("all")];
  }, [t]);

  const filteredPromotions = useMemo(() => {
    if (!nameSearch) return promotions;
    return promotions.filter((p) =>
      p.studentName.toLowerCase().includes(nameSearch.toLowerCase())
    );
  }, [promotions, nameSearch]);

  const columns = [
    { key: "student", label: t("student") },
    { key: "studentId", label: t("studentIdLabel") },
    { key: "fromYear", label: t("fromYear") },
    { key: "toYear", label: t("toYear") },
    { key: "fromClass", label: t("fromClass") },
    { key: "toClass", label: t("toClass") },
    { key: "date", label: t("dateLabel") },
    { key: "promotedBy", label: t("promotedBy") },
    { key: "status", label: t("status") },
    { key: "action", label: t("actions") },
  ];

  const safeName = (fullName) => {
    if (!fullName || typeof fullName !== "string") return "??";
    return (
      fullName
        .split(" ")
        .map((n) => (n ? n[0] : ""))
        .join("")
        .slice(0, 2)
        .toUpperCase() || "??"
    );
  };

  const renderRow = (promotion) => (
    <>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden">
            {getImageUrl(promotion.studentImage) ? (
              <img
                src={getImageUrl(promotion.studentImage)}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : null}
            <span
              className={getImageUrl(promotion.studentImage) ? "hidden" : ""}
            >
              {safeName(promotion.studentName)}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {promotion.studentName}
          </span>
        </div>
      </td>
      <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">
        {promotion.studentIdLabel}
      </td>
      <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">
        {promotion.prevYear}
      </td>
      <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">
        {promotion.newYear}
      </td>
      <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">
        {promotion.prevClass}
      </td>
      <td className="px-4 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400">
        {promotion.newClass}
      </td>
      <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
        {promotion.date}
      </td>
      <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">
        {promotion.promotedBy}
      </td>
      <td className="px-4 py-2.5">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            promotion.status === "Reversed"
              ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              : promotion.status === "Completed"
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${promotion.status === "Reversed" ? "bg-gray-400" : promotion.status === "Completed" ? "bg-green-500" : "bg-yellow-500"}`}
          />
          {promotion.status}
        </span>
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-1">
          {!promotion.reversed && (
            <button
              onClick={() => handleReverseClick(promotion.id)}
              className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
              title={t("reverse")}
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => handleDeleteClick(promotion.id)}
            className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
            title={t("delete")}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t("promotionHistory")}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ArrowTrendingUpIcon}
          label={t("totalPromotions")}
          value={cards.total}
          color="blue"
        />
        <StatCard
          icon={AcademicCapIcon}
          label={t("promotionsThisYear")}
          value={cards.thisYear}
          color="green"
        />
        <StatCard
          icon={ClockIcon}
          label={t("promotionsThisMonth")}
          value={cards.thisMonth}
          color="yellow"
        />
        <StatCard
          icon={StarIcon}
          label={t("latestPromotion")}
          value={cards.latest}
          color="blue"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="w-full sm:w-44">
          <SelectInput
            label={t("academicYear")}
            name="yearFilter"
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }}
            options={yearOptions}
          />
        </div>
        <div className="w-full sm:w-44">
          <SelectInput
            label={t("class")}
            name="classFilter"
            value={classFilter}
            onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}
            options={[t("allClasses"), ...CLASS_NAMES]}
          />
        </div>
        <div className="w-full sm:w-56">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t("searchStudentName")}
          </label>
          <SearchInput
            placeholder={t("searchStudentName")}
            value={nameSearch}
            onChange={setNameSearch}
          />
        </div>
        <div className="sm:pb-4">
          <Button
            variant="secondary"
            onClick={resetFilters}
            className="w-auto px-5 py-2.5"
          >
            {t("reset")}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400 dark:text-gray-500">
          <Spinner size="sm" className="text-blue-500 mx-auto mb-2" />
          <p className="text-sm">{t("loading")}</p>
        </div>
      ) : filteredPromotions.length > 0 ? (
        <>
          <Table
            columns={columns}
            data={filteredPromotions}
            renderRow={renderRow}
          />
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalRecords}
            itemsPerPage={pagination.limit}
            onPageChange={setCurrentPage}
            disabled={loading}
          />
        </>
      ) : (
        <div className="text-center py-10 text-gray-400 dark:text-gray-500">
          <p className="text-sm">{t("noPromotions")}</p>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title={`${t("delete")} ${t("promotionHistory")}`}
        message={t("confirmDelete")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmationModal
        isOpen={!!reverseId}
        onClose={() => setReverseId(null)}
        title={t("reversePromotion")}
        message={t("confirmReversePromotion")}
        confirmLabel={t("reverse")}
        cancelLabel={t("cancel")}
        variant="primary"
        loading={reversing}
        onConfirm={handleReverseConfirm}
      />
    </div>
  );
};

export default PromotionHistory;
