import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { PrivacyPolicyDialog } from './PrivacyPolicyDialog';

interface PhoneConsultationFormProps {
  title?: string;
}

// const SITE_ID = import.meta.env.VITE_SITE_ID ?? 'teeth'; // 이 줄은 더 이상 사용하지 않습니다.

export function PhoneConsultationForm({ title }: PhoneConsultationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',      // YYYYMMDD
    gender: '',
    phoneNumber: '',    // 8자리
    agreedToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const birthDateInputRef = useRef<HTMLInputElement>(null);
  const phoneNumberInputRef = useRef<HTMLInputElement>(null);

  const handleInputFocus = (inputRef: React.RefObject<HTMLInputElement>) => {
    if (inputRef.current && window.innerWidth <= 768) {
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () =>
    setFormData({ name: '', birthDate: '', gender: '', phoneNumber: '', agreedToTerms: false });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const now = new Date();
    const kstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));

    try {
      const payload = {
        type: 'phone' as const,
        site: 'insurance-comparison', // 사이트 고유 ID
        name: formData.name.trim(),
        phone: `010-${(formData.phoneNumber || '').trim()}`,
        birth: formData.birthDate.trim(),
        gender: formData.gender as '남' | '여' | '',
        requestedAt: kstDate.toISOString(),
      };

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `서버 오류(${res.status})`);
      }

      alert('✅ 전화 상담 신청이 정상적으로 접수되었습니다!');
      resetForm();
    } catch (err: any) {
      console.error('전화상담 제출 오류:', err);
      alert('제출 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      <div
        className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20"
        style={{
          boxShadow: `
            0 25px 50px -12px rgba(0, 0, 0, 0.4),
            0 20px 25px -5px rgba(0, 0, 0, 0.2),
            0 10px 10px -5px rgba(0, 0, 0, 0.15),
            0 4px 6px -2px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.1)
          `,
        }}
      >
        <div className="text-center space-y-1.5 mb-5">
          <p className="text-white text-[22px] md:text-2xl font-extrabold tracking-tight drop-shadow-[0_1px_10px_rgba(0,0,0,.30)]">
            보험 전문가가 유선상으로
          </p>
          <p className="text-[22px] md:text-2xl font-black bg-gradient-to-b from-[#FFB648] to-[#FF7A3D] bg-clip-text text-transparent drop-shadow-[0_1px_12px_rgba(255,152,64,.28)]">
            보다 자세한 설명을 해드립니다.
          </p>
          {title && <p className="mt-2 text-white/85 text-[13px] md:text-sm">{title}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <label className="text-white text-base block">이름</label>
            <Input
              ref={nameInputRef}
              placeholder="한글 이름을 입력"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              onFocus={() => handleInputFocus(nameInputRef)}
              className="bg-white border-0 h-12 text-gray-800 placeholder:text-gray-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-white text-base block">생년월일</label>
            <Input
              ref={birthDateInputRef}
              placeholder="생년월일을 입력 (예:19850101)"
              value={formData.birthDate}
              onChange={e => handleInputChange('birthDate', e.target.value)}
              onFocus={() => handleInputFocus(birthDateInputRef)}
              className="bg-white border-0 h-12 text-gray-800 placeholder:text-gray-500"
              maxLength={8}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-white text-base block">성별</label>
            <div className="flex h-12 bg-white rounded-md overflow-hidden">
              <Button
                type="button"
                onClick={() => handleInputChange('gender', '남')}
                className={`flex-1 flex items-center justify-center space-x-2 rounded-none h-full border-0 ${
                  formData.gender === '남'
                    ? 'bg-[#f59e0b] text-white hover:bg-[#d97706]'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.gender === '남' ? 'bg-orange-400' : 'bg-gray-300'}`}>👨</div>
                <span>남</span>
              </Button>
              <Button
                type="button"
                onClick={() => handleInputChange('gender', '여')}
                className={`flex-1 flex items-center justify-center space-x-2 rounded-none h-full border-0 ${
                  formData.gender === '여'
                    ? 'bg-[#f59e0b] text-white hover:bg-[#d97706]'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.gender === '여' ? 'bg-orange-400' : 'bg-gray-300'}`}>👩</div>
                <span>여</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-white text-base block">전화번호</label>
            <div className="flex space-x-2">
              <div className="bg-white rounded-md px-3 py-3 text-gray-800 text-base w-16 text-center">010</div>
              <span className="text-white text-2xl flex items-center">-</span>
              <Input
                ref={phoneNumberInputRef}
                placeholder="휴대폰번호 8자리 입력"
                value={formData.phoneNumber}
                onChange={e => handleInputChange('phoneNumber', e.target.value)}
                onFocus={() => handleInputFocus(phoneNumberInputRef)}
                className="bg-white border-0 h-12 text-gray-800 placeholder:text-gray-500 flex-1"
                maxLength={8}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="phone-terms-agreement"
                checked={formData.agreedToTerms}
                onCheckedChange={checked => handleInputChange('agreedToTerms', !!checked)}
                className="border-white data-[state=checked]:bg-[#f59e0b] data-[state=checked]:border-[#f59e0b]"
              />
              <label htmlFor="phone-terms-agreement" className="text-white text-base cursor-pointer">
                개인정보 수집 및 이용동의
              </label>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPrivacyDialog(true)}
              className="bg-white text-gray-800 border-white hover:bg-gray-100 h-8 px-3"
            >
              자세히 보기
            </Button>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={
                !formData.name ||
                !formData.birthDate ||
                !formData.gender ||
                !formData.phoneNumber ||
                !formData.agreedToTerms ||
                isSubmitting
              }
              className="w-full h-14 bg-[#f59e0b] hover:bg-[#d97706] text-white border-0 rounded-full text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '신청 중...' : '전화상담 신청하기'}
            </Button>
          </div>
        </form>
      </div>

      <PrivacyPolicyDialog isOpen={showPrivacyDialog} onClose={() => setShowPrivacyDialog(false)} />
    </div>
  );
}