import { Globe, Award, BookOpen, Shield, ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nProvider";

const InternationalBoard = () => {
    const { t } = useI18n();

    const boardMembers = [
        {
            id: "etienne",
            image: "/images/board/etienne.png",
            icon: Shield,
        },
        {
            id: "handerson",
            image: "/images/board/handerson.jpg",
            icon: BookOpen,
        },
        {
            id: "leonardo",
            image: "/images/board/leonardo.jpg",
            icon: Globe,
        },
        {
            id: "haila",
            image: "/images/board/haila.jpg",
            icon: ScrollText,
        },
    ];

    return (
        <section className="py-24 bg-[hsl(222_47%_11%)] relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-dot-pattern opacity-10" />
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-bl-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-accent/5 rounded-tr-full blur-3xl" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <Badge className="bg-accent/20 text-accent border-accent/30 mb-4 font-semibold">
                        <Globe className="h-3 w-3 mr-1" />
                        {t("board.badge")}
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-6 text-3d-white">
                        {t("board.title")}
                    </h2>
                    <p className="text-lg text-white/70 max-w-4xl mx-auto leading-relaxed">
                        {t("board.description")}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {boardMembers.map((member) => (
                        <Card
                            key={member.id}
                            className="bg-glass-card border-white/10 hover:border-accent/30 transition-all duration-300 group overflow-hidden"
                        >
                            <CardContent className="p-0 flex flex-col sm:flex-row h-full">
                                {/* Image Section */}
                                <div className="sm:w-2/5 relative h-64 sm:h-auto overflow-hidden">
                                    <img
                                        src={member.image}
                                        alt={t(`board.${member.id}.name`)}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/80" />
                                </div>

                                {/* Content Section */}
                                <div className="p-6 sm:w-3/5 flex flex-col justify-center relative">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-display font-bold text-white mb-1 group-hover:text-accent transition-colors">
                                            {t(`board.${member.id}.name`)}
                                        </h3>
                                        <p className="text-accent text-sm font-semibold uppercase tracking-wider">
                                            {t(`board.${member.id}.role`)}
                                        </p>
                                    </div>

                                    <p className="text-white/70 text-sm leading-relaxed mb-4">
                                        {t(`board.${member.id}.desc`)}
                                    </p>

                                    <div className="mt-auto">
                                        <member.icon className="h-5 w-5 text-white/40 group-hover:text-accent transition-colors" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InternationalBoard;
