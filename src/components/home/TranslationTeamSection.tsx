import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const TranslationTeamSection = () => {
    const { t } = useI18n();

    const members = [
        "Glebenice Costa Ribeiro",
        "Jacob Ampion Leon",
        "Nduwayo Alexis",
        "Elionay de Souza Leitão",
        "Kartodimedjo Noah",
        "Courreur Samya"
    ];

    return (
        <section className="py-24 bg-[hsl(220_50%_12%)] relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-4 font-semibold">
                        <Users className="h-3 w-3 mr-1" />
                        {t('translation_team.badge')}
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-4 text-3d-white">
                        {t('translation_team.title')}
                    </h2>
                    <p className="text-lg text-white/70 max-w-2xl mx-auto">
                        {t('translation_team.description')}
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Featured Member - Elionay */}
                    <Card className="lg:col-span-1 bg-glass-card border-accent/20 overflow-hidden shadow-2xl group hover:border-accent/40 transition-all duration-500 transform hover:-translate-y-1">
                        <div className="aspect-[3/4] relative overflow-hidden">
                            <img
                                src="/images/team/elionay.jpg"
                                alt={t('translation_team.elionay.name')}
                                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <p className="text-xs font-bold text-accent uppercase tracking-widest mb-1">
                                    {t('translation_team.elionay.role')}
                                </p>
                                <h3 className="text-xl font-display font-black text-white">
                                    {t('translation_team.elionay.name')}
                                </h3>
                            </div>
                        </div>
                    </Card>

                    {/* Team List & Group Photo */}
                    <Card className="lg:col-span-2 bg-glass-card border-white/10 overflow-hidden shadow-2xl group hover:border-emerald-500/30 transition-all duration-500">
                        <CardContent className="p-0 h-full flex flex-col">
                            <div className="relative h-64 w-full overflow-hidden">
                                <img
                                    src="/images/team/translation_team.jpg"
                                    alt="Translation Correction Team"
                                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            </div>

                            <div className="p-8 flex-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {members.filter(m => m !== "Elionay de Souza Leitão").map((member, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-3 text-white/90 bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                                        >
                                            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                                            <span className="font-medium text-sm">{member}</span>
                                        </div>
                                    ))}
                                    {/* Small indicator for the featured member in the list if needed */}
                                    <div className="flex items-center space-x-3 text-accent/90 bg-accent/10 backdrop-blur-sm p-3 rounded-lg border border-accent/20">
                                        <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                                        <span className="font-bold text-sm">Elionay de Souza Leitão</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
};

export default TranslationTeamSection;
