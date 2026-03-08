# PROJECT_BRIEF.md
## Purpose

---

## 1. Project Summary

### Project Name
ScoutWo

### One-Sentence Description
Kadınlar için birden fazla markayı tek arayüzden tarayan akıllı alışveriş asistanı

### Business Objective
Kullanıcıların Nike, Adidas gibi markaları tek tek gezmek yerine, tek bir arayüzden arama yapıp karşılaştırma yapabilmesi

### Desired Outcome
- Kullanıcı arama oluşturur, markalar seçer
- "Ürünleri Listele" tıklar
- Tüm markalardan ürünler taranır ve gösterilir
- Fiyat/görsel karşılaştırması yapılabilir

### Primary Users
- E-ticaret alışverişi yapan kullanıcılar (öncelikle kadınlar)

### Main Stakeholders
- Cengiz Reis (Product Owner)

---

## 2. Business Context

### Problem Being Solved
Farklı markaların sitelerini tek tek gezip ürün aramak zaman alıcı

### Why It Matters Now
AI Development Pipeline POC projesi olarak kullanılıyor

### Expected Business Value
- Zaman tasarrufu
- Daha iyi alışveriş kararları
- AI pipeline test platformu

### Success Metrics
- Arama oluşturma → Ürün listeleme akışının çalışması
- Gerçek ürün verilerinin görüntülenmesi

---

## 3. Scope

### In Scope
- Kullanıcı kaydı/girişi
- Arama oluşturma (sorgu + marka seçimi)
- Ürün scraping (Playwright)
- Ürün listeleme ve görüntüleme

### Out of Scope
- Ödeme sistemi
- Satın alma yönlendirmesi
- Mobil uygulama

### Assumptions
- Marka siteleri scraping'e izin veriyor veya tolere ediyor
- Playwright headless browser çalışıyor

### Constraints
- Single VPS hosting (Coolify)
- Limited scraping rate (spam önleme)

---

## 4. Product and Delivery Priorities

### Priority Order
1. İşlevsellik (scraping çalışsın)
2. Güvenilirlik (hatalar handle edilsin)
3. Hız (reasonable response times)
4. Kod kalitesi

### Trade-Off Guidance
- MVP öncelikli - polish sonra
- Scraping çalışsın, edge case'ler sonra

---

## 5. Current Focus

### Active Milestone
AI Pipeline POC - Tek agent, süreç bazlı çalışma testi

### Current High-Priority Objectives
1. "Ürünleri Listele" butonu tam çalışsın
2. Gerçek ürünler görüntülensin (mock değil)

### Current Delivery Risks
- Worker deployment unutulabilir
- Scraping selectors kırılabilir

---

## 6. Definition of Success for the Current Stage

**Success:**
- Kullanıcı arama oluşturur
- "Ürünleri Listele" tıklar
- Gerçek Nike/Adidas ürünleri görüntülenir

**Failure:**
- Buton çalışmaz
- Mock data görünür
- Worker crash
